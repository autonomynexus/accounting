import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { EUR, monetary } from "@autonomynexus/monetary";
import {
  Ca12GeneratorService,
  Ca12GeneratorServiceLayer,
} from "../src/vat/declarations/ca12-generator.js";
import { JournalDataPort } from "../src/ports/journal-data.port.js";
import { BespokeJournalData } from "../src/bespoke/journal-data.bespoke.js";
import type { JournalEntryModel, JournalLineModel } from "../src/models.js";

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

describe("Ca12GeneratorService", () => {
  const exercice = {
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
  };

  it("generates empty CA12 with no entries", async () => {
    const bespokeData = BespokeJournalData.make({ entries: [], lines: [] });
    const layer = Ca12GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca12GeneratorService;
        return yield* service.generate({ userId: "user1", exercice });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.exerciceStart).toEqual(exercice.startDate);
    expect(result.exerciceEnd).toEqual(exercice.endDate);
    expect(result.ligne19.amount).toBe(0);
    expect(result.ligne28.amount).toBe(0);
    expect(result.ligne33.amount).toBe(0);
    expect(result.ligne34.amount).toBe(0);
  });

  it("generates CA12 with revenue + TVA 20% over 12 months", async () => {
    // Simulate 12 months of invoicing: 1000€ HT/month × 12 = 12,000€ HT + 2,400€ TVA
    const entries: JournalEntryModel[] = [];
    const lines: JournalLineModel[] = [];
    let lineId = 1;

    for (let month = 0; month < 12; month++) {
      const date = new Date(2025, month, 15);
      const entryId = month + 1;
      entries.push(mkEntry(entryId, date));
      lines.push(mkLine(lineId++, entryId, "411", 120000, null)); // 1200€ TTC
      lines.push(mkLine(lineId++, entryId, "706", null, 100000)); // 1000€ HT
      lines.push(mkLine(lineId++, entryId, "4457", null, 20000, "TVA20")); // 200€ TVA
    }

    const bespokeData = BespokeJournalData.make({ entries, lines });
    const layer = Ca12GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca12GeneratorService;
        return yield* service.generate({ userId: "user1", exercice });
      }).pipe(Effect.provide(layer)),
    );

    // TVA collected: 12 × 200€ = 2,400€ = 240000 cents
    expect(result.ligne5A.base.amount).toBe(1200000); // 12,000€ HT
    expect(result.ligne5A.tva.amount).toBe(240000); // 2,400€ TVA
    expect(result.ligne19.amount).toBe(240000); // Total TVA brute

    // No deductions, no credit → net due = 2,400€
    expect(result.ligne28.amount).toBe(240000);
    expect(result.ligne29.amount).toBe(0); // no credit
  });

  it("handles acomptes already paid (deducted from total)", async () => {
    const date = new Date(2025, 5, 15);
    const entries = [mkEntry(1, date)];
    const lines = [
      mkLine(1, 1, "411", 1200000, null), // 12,000€ TTC
      mkLine(2, 1, "706", null, 1000000), // 10,000€ HT
      mkLine(3, 1, "4457", null, 200000, "TVA20"), // 2,000€ TVA
    ];

    const bespokeData = BespokeJournalData.make({ entries, lines });
    const layer = Ca12GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    // Acomptes: 1,100€ July + 800€ December = 1,900€
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca12GeneratorService;
        return yield* service.generate({
          userId: "user1",
          exercice,
          acompteJuillet: m(110000), // 1,100€
          acompteDécembre: m(80000), // 800€
        });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.ligne28.amount).toBe(200000); // 2,000€ TVA brute
    expect(result.ligne30.amount).toBe(190000); // 1,900€ acomptes
    // Net to pay: 2,000 - 1,900 = 100€
    expect(result.ligne33.amount).toBe(10000); // 100€
    expect(result.ligne34.amount).toBe(0); // no credit
  });

  it("handles previous credit carried forward", async () => {
    const bespokeData = BespokeJournalData.make({ entries: [], lines: [] });
    const layer = Ca12GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca12GeneratorService;
        return yield* service.generate({
          userId: "user1",
          exercice,
          previousCredit: m(50000), // 500€ credit from last year
        });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.ligne24.amount).toBe(50000); // 500€ previous credit
    expect(result.ligne34.amount).toBe(50000); // credit carried forward (no activity)
  });

  it("rejects invalid exercice dates", async () => {
    const bespokeData = BespokeJournalData.make({ entries: [], lines: [] });
    const layer = Ca12GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca12GeneratorService;
        return yield* service.generate({
          userId: "user1",
          exercice: { startDate: new Date("2025-12-31"), endDate: new Date("2025-01-01") },
        });
      }).pipe(Effect.provide(layer), Effect.either),
    );

    expect(result._tag).toBe("Left");
  });

  it("handles TVA deductible on purchases (ABS)", async () => {
    const date = new Date(2025, 3, 15);
    const entries = [mkEntry(1, date), mkEntry(2, date)];
    const lines = [
      // Revenue: 5,000€ HT + 1,000€ TVA
      mkLine(1, 1, "411", 600000, null),
      mkLine(2, 1, "706", null, 500000),
      mkLine(3, 1, "4457", null, 100000, "TVA20"),
      // Purchase: 2,000€ HT + 400€ TVA deductible
      mkLine(4, 2, "601", 200000, null),
      mkLine(5, 2, "44566", 40000, null), // TVA déductible ABS
      mkLine(6, 2, "401", null, 240000),
    ];

    const bespokeData = BespokeJournalData.make({ entries, lines });
    const layer = Ca12GeneratorServiceLayer.pipe(
      Layer.provide(Layer.succeed(JournalDataPort, bespokeData)),
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* Ca12GeneratorService;
        return yield* service.generate({ userId: "user1", exercice });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.ligne19.amount).toBe(100000); // 1,000€ TVA brute
    expect(result.ligne20.amount).toBe(40000); // 400€ TVA deductible
    // Net: 1000 - 400 = 600€
    expect(result.ligne28.amount).toBe(60000);
  });
});
