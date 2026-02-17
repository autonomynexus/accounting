import { describe, it, expect } from "vitest";
import { Effect, Layer } from "effect";
import { EUR, monetary } from "monetary";
import type { JournalEntryModel, JournalLineModel } from "../src/models";
import { AccountingDataPort } from "../src/ports";
import { VatService, VatServiceLayer } from "../src/vat/service";

const m = (amount: number) => monetary({ amount, currency: EUR });

const period = {
  startDate: new Date(2025, 0, 1),
  endDate: new Date(2025, 2, 31),
};

function makeEntry(id: number, date: Date): JournalEntryModel {
  return {
    id,
    userId: "user1",
    transactionId: null,
    date,
    description: `Entry ${id}`,
    reference: null,
    sourceId: "MANUAL",
    statusId: "VALIDATED",
    validatedAt: date,
    periodId: null,
    createdAt: date,
    updatedAt: date,
  };
}

function makeVatLine(
  id: number,
  entryId: number,
  accountCode: string,
  vatCode: string,
  debit: number,
  credit: number,
): JournalLineModel {
  return {
    id,
    journalEntryId: entryId,
    accountCode,
    debitAmount: m(debit),
    creditAmount: m(credit),
    description: null,
    vatCode,
    createdAt: new Date(2025, 0, 15),
  };
}

function makeDataLayer(entries: JournalEntryModel[], lines: JournalLineModel[]) {
  return Layer.succeed(
    AccountingDataPort,
    AccountingDataPort.of({
      getAccountBalancesByClass: () => Effect.succeed([]),
      getAccountBalances: () => Effect.succeed([]),
      findJournalEntriesByPeriod: (userId, p) =>
        Effect.succeed(
          entries.filter(
            (e) => e.userId === userId && e.date >= p.startDate && e.date <= p.endDate,
          ),
        ),
      findJournalLinesByEntryIds: (_userId, entryIds) =>
        Effect.succeed(lines.filter((l) => entryIds.includes(l.journalEntryId))),
    }),
  );
}

describe("VatService", () => {
  it("returns zeros for franchise regime", async () => {
    const dataLayer = makeDataLayer([], []);
    const layer = VatServiceLayer.pipe(Layer.provide(dataLayer));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* VatService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period,
          regime: "franchise",
        });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.regime).toBe("franchise");
    expect(result.byRate).toHaveLength(0);
    expect(result.totals.totalCollected.amount).toBe(0);
    expect(result.totals.totalDeductible.amount).toBe(0);
    expect(result.totals.netVat.amount).toBe(0);
    expect(result.isCredit).toBe(false);
  });

  it("computes VAT declaration with single rate", async () => {
    const entries = [makeEntry(1, new Date(2025, 1, 15))];
    const lines = [
      // VAT collected (4457) - credit side
      makeVatLine(1, 1, "4457", "TVA20", 0, 2000_00),
      // VAT deductible (4456) - debit side
      makeVatLine(2, 1, "4456", "TVA20", 500_00, 0),
    ];

    const dataLayer = makeDataLayer(entries, lines);
    const layer = VatServiceLayer.pipe(Layer.provide(dataLayer));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* VatService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period,
          regime: "reel_simplifie",
        });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.byRate).toHaveLength(1);
    expect(result.byRate[0]!.code).toBe("TVA20");
    expect(result.byRate[0]!.collected.amount).toBe(2000_00);
    expect(result.byRate[0]!.deductible.amount).toBe(500_00);
    expect(result.totals.netVat.amount).toBe(1500_00);
    expect(result.isCredit).toBe(false);
  });

  it("computes VAT with multiple rates", async () => {
    const entries = [
      makeEntry(1, new Date(2025, 1, 10)),
      makeEntry(2, new Date(2025, 1, 20)),
    ];
    const lines = [
      makeVatLine(1, 1, "4457", "TVA20", 0, 1000_00),
      makeVatLine(2, 1, "4456", "TVA20", 200_00, 0),
      makeVatLine(3, 2, "4457", "TVA10", 0, 500_00),
      makeVatLine(4, 2, "4456", "TVA10", 100_00, 0),
    ];

    const dataLayer = makeDataLayer(entries, lines);
    const layer = VatServiceLayer.pipe(Layer.provide(dataLayer));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* VatService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period,
          regime: "reel_simplifie",
        });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.byRate).toHaveLength(2);
    expect(result.totals.totalCollected.amount).toBe(1500_00);
    expect(result.totals.totalDeductible.amount).toBe(300_00);
    expect(result.totals.netVat.amount).toBe(1200_00);
  });

  it("handles batch declarations", async () => {
    const q1 = { startDate: new Date(2025, 0, 1), endDate: new Date(2025, 2, 31) };
    const q2 = { startDate: new Date(2025, 3, 1), endDate: new Date(2025, 5, 30) };

    const entries = [
      makeEntry(1, new Date(2025, 1, 15)),
      makeEntry(2, new Date(2025, 4, 15)),
    ];
    const lines = [
      makeVatLine(1, 1, "4457", "TVA20", 0, 1000_00),
      makeVatLine(2, 2, "4457", "TVA20", 0, 2000_00),
    ];

    const dataLayer = makeDataLayer(entries, lines);
    const layer = VatServiceLayer.pipe(Layer.provide(dataLayer));

    const results = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* VatService;
        return yield* svc.computeDeclarationsBatch([
          { userId: "user1", period: q1, regime: "reel_simplifie" },
          { userId: "user1", period: q2, regime: "reel_simplifie" },
        ]);
      }).pipe(Effect.provide(layer)),
    );

    expect(results).toHaveLength(2);
    expect(results[0]!.totals.totalCollected.amount).toBe(1000_00);
    expect(results[1]!.totals.totalCollected.amount).toBe(2000_00);
  });
});
