import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { EUR, monetary } from "@autonomynexus/monetary";
import {
  Ca3GeneratorService,
  Ca3GeneratorServiceLayer,
} from "../src/vat/declarations/ca3-generator";
import { JournalDataPort } from "../src/ports/journal-data.port";
import { BespokeJournalData } from "../src/bespoke/journal-data.bespoke";
import type { JournalEntryModel, JournalLineModel } from "../src/models";

const m = (cents: number) => monetary({ amount: cents, currency: EUR });

const mkEntry = (id: number, date: Date): JournalEntryModel => ({
  id,
  userId: "user1",
  transactionId: null,
  date,
  description: "Test entry",
  reference: null,
  sourceId: "MANUAL",
  statusId: "VALIDATED",
  validatedAt: date,
  periodId: null,
  createdAt: date,
  updatedAt: date,
});

const mkLine = (
  id: number,
  entryId: number,
  accountCode: string,
  debit: number | null,
  credit: number | null,
  vatCode: string | null = null,
): JournalLineModel => ({
  id,
  journalEntryId: entryId,
  accountCode,
  debitAmount: debit !== null ? m(debit) : null,
  creditAmount: credit !== null ? m(credit) : null,
  description: null,
  vatCode,
  sectorId: null,
  taxeAssimileeType: null,
  acciseType: null,
  createdAt: new Date("2025-01-15"),
});

describe("Ca3GeneratorService", () => {
  const period = { startDate: new Date("2025-01-01"), endDate: new Date("2025-01-31") };

  it("generates empty CA3 with no entries", async () => {
    const bespokeData = BespokeJournalData.make({ entries: [], lines: [] });
    const layer = Ca3GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca3GeneratorService;
        return yield* service.generate({ userId: "user1", period });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.ligne01.amount).toBe(0);
    expect(result.ligne16.amount).toBe(0);
    expect(result.ligne32.amount).toBe(0);
  });

  it("generates CA3 with revenue + TVA 20%", async () => {
    const date = new Date("2025-01-15");
    const entries = [mkEntry(1, date)];
    const lines = [
      mkLine(1, 1, "411", 120000, null), // Client debit 1200€
      mkLine(2, 1, "706", null, 100000), // Revenue credit 1000€
      mkLine(3, 1, "4457", null, 20000, "TVA20"), // TVA collected 200€
    ];

    const bespokeData = BespokeJournalData.make({ entries, lines });
    const layer = Ca3GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca3GeneratorService;
        return yield* service.generate({ userId: "user1", period });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.ligne01.amount).toBe(100000); // 1000€ HT
    expect(result.ligne08.base.amount).toBe(100000); // TVA 20% base
    expect(result.ligne08.tva.amount).toBe(20000); // TVA 20%
    expect(result.ligne16.amount).toBe(20000); // Total TVA brute
    expect(result.ligne32.amount).toBe(20000); // Total to pay
  });

  it("generates CA3 with deductible VAT creating credit", async () => {
    const date = new Date("2025-01-15");
    const entries = [mkEntry(1, date), mkEntry(2, date)];
    const lines = [
      // Revenue entry: 600€ TTC = 500€ HT + 100€ TVA
      mkLine(1, 1, "411", 60000, null),
      mkLine(2, 1, "706", null, 50000),
      mkLine(3, 1, "4457", null, 10000, "TVA20"),
      // Expense: 2400€ TTC = 2000€ HT + 400€ TVA deductible
      mkLine(4, 2, "606", 200000, null),
      mkLine(5, 2, "44566", 40000, null), // TVA déductible ABS
      mkLine(6, 2, "401", null, 240000),
    ];

    const bespokeData = BespokeJournalData.make({ entries, lines });
    const layer = Ca3GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca3GeneratorService;
        return yield* service.generate({ userId: "user1", period });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.ligne16.amount).toBe(10000); // 100€ TVA brute
    expect(result.ligne19.amount).toBe(40000); // 400€ TVA déductible ABS
    expect(result.ligne23.amount).toBe(40000); // Total déductible
    expect(result.ligne25.amount).toBe(30000); // 300€ credit
    expect(result.ligne28.amount).toBe(0); // Nothing to pay
  });
});
