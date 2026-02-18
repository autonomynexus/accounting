import { Effect, Layer, Schema } from "effect";
import { add, EUR, type Monetary, monetary, subtract } from "monetary";
import type { JournalEntryModel, JournalLineModel, Period } from "../models";
import { AccountingDataPort, type AccountingDataError } from "../ports";
import type {
  ComputeVatDeclarationInput,
  VatByRate,
  VatDeclarationResult,
  VatTotals,
} from "./models";
import {
  isValidVatCode,
  VAT_COLLECTED_ACCOUNT,
  VAT_DEDUCTIBLE_ACCOUNT,
  type VatCode,
} from "./utils";

// ============================================================================
// Tagged Errors
// ============================================================================

export class InvalidVatCodeError extends Schema.TaggedError<InvalidVatCodeError>()(
  "InvalidVatCodeError",
  {
    vatCode: Schema.NullOr(Schema.String),
    accountCode: Schema.String,
    journalLineId: Schema.Number,
  },
) {}

// ============================================================================
// Service Interface
// ============================================================================

export type VatServiceInterface = {
  readonly computeDeclaration: (
    input: ComputeVatDeclarationInput,
  ) => Effect.Effect<VatDeclarationResult, AccountingDataError | InvalidVatCodeError>;

  readonly computeDeclarationsBatch: (
    inputs: readonly ComputeVatDeclarationInput[],
  ) => Effect.Effect<readonly VatDeclarationResult[], AccountingDataError | InvalidVatCodeError>;
};

// ============================================================================
// Service Tag
// ============================================================================

export class VatService extends Effect.Tag("@accounting/VatService")<
  VatService,
  VatServiceInterface
>() {}

// ============================================================================
// Helpers
// ============================================================================

const zeroMonetary = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

const zeroTotals = (): VatTotals => ({
  totalCollected: zeroMonetary(),
  totalDeductible: zeroMonetary(),
  netVat: zeroMonetary(),
});

const computeVatFromLines = (
  period: Period,
  regime: ComputeVatDeclarationInput["regime"],
  allLines: JournalLineModel[],
  allEntries: JournalEntryModel[],
): Effect.Effect<VatDeclarationResult, InvalidVatCodeError> =>
  Effect.gen(function* () {
    if (regime === "franchise") {
      return { period, regime, byRate: [], totals: zeroTotals(), isCredit: false };
    }

    const periodEntries = allEntries.filter(
      (e) => e.date >= period.startDate && e.date <= period.endDate && e.statusId === "VALIDATED",
    );

    if (periodEntries.length === 0) {
      return { period, regime, byRate: [], totals: zeroTotals(), isCredit: false };
    }

    const periodEntryIds = new Set(periodEntries.map((e) => e.id));
    const vatLines = allLines.filter(
      (line) =>
        periodEntryIds.has(line.journalEntryId) &&
        (line.accountCode === VAT_COLLECTED_ACCOUNT || line.accountCode === VAT_DEDUCTIBLE_ACCOUNT),
    );

    const byRateMap = new Map<
      VatCode,
      { collected: Monetary<number>; deductible: Monetary<number> }
    >();

    for (const line of vatLines) {
      if (!isValidVatCode(line.vatCode)) {
        return yield* new InvalidVatCodeError({
          vatCode: line.vatCode,
          accountCode: line.accountCode,
          journalLineId: line.id,
        });
      }

      const vatCode = line.vatCode;
      const existing = byRateMap.get(vatCode) || {
        collected: zeroMonetary(),
        deductible: zeroMonetary(),
      };

      if (line.accountCode === VAT_COLLECTED_ACCOUNT) {
        existing.collected = add(existing.collected, line.creditAmount ?? zeroMonetary());
      } else {
        existing.deductible = add(existing.deductible, line.debitAmount ?? zeroMonetary());
      }

      byRateMap.set(vatCode, existing);
    }

    const byRate: VatByRate[] = [];
    let totalCollected = zeroMonetary();
    let totalDeductible = zeroMonetary();

    for (const [code, amounts] of byRateMap) {
      const net = subtract(amounts.collected, amounts.deductible);
      byRate.push({ code, collected: amounts.collected, deductible: amounts.deductible, net });
      totalCollected = add(totalCollected, amounts.collected);
      totalDeductible = add(totalDeductible, amounts.deductible);
    }

    byRate.sort((a, b) => a.code.localeCompare(b.code));

    const netVat = subtract(totalCollected, totalDeductible);

    return {
      period,
      regime,
      byRate,
      totals: { totalCollected, totalDeductible, netVat },
      isCredit: netVat.amount < 0,
    };
  });

// ============================================================================
// Service Implementation
// ============================================================================

export const VatServiceLayer = Layer.effect(
  VatService,
  Effect.gen(function* () {
    const dataPort = yield* AccountingDataPort;

    const computeDeclaration: VatServiceInterface["computeDeclaration"] = (input) =>
      Effect.gen(function* () {
        const { userId, period, regime } = input;

        if (regime === "franchise") {
          return { period, regime, byRate: [], totals: zeroTotals(), isCredit: false };
        }

        const entries = yield* dataPort.findJournalEntriesByPeriod(userId, period);

        if (entries.length === 0) {
          return { period, regime, byRate: [], totals: zeroTotals(), isCredit: false };
        }

        const entryIds = entries.filter((e) => e.statusId === "VALIDATED").map((e) => e.id);

        if (entryIds.length === 0) {
          return { period, regime, byRate: [], totals: zeroTotals(), isCredit: false };
        }

        const allLines = yield* dataPort.findJournalLinesByEntryIds(userId, entryIds);

        return yield* computeVatFromLines(period, regime, allLines, entries);
      });

    const computeDeclarationsBatch: VatServiceInterface["computeDeclarationsBatch"] = (inputs) =>
      Effect.gen(function* () {
        if (inputs.length === 0) return [];

        const first = inputs[0];
        if (!first) return [];
        const userId = first.userId;

        let minDate = first.period.startDate;
        let maxDate = first.period.endDate;
        for (const input of inputs) {
          if (input.period.startDate < minDate) minDate = input.period.startDate;
          if (input.period.endDate > maxDate) maxDate = input.period.endDate;
        }

        const allEntries = yield* dataPort.findJournalEntriesByPeriod(userId, {
          startDate: minDate,
          endDate: maxDate,
        });

        const validatedEntryIds = allEntries
          .filter((e) => e.statusId === "VALIDATED")
          .map((e) => e.id);

        const allLines =
          validatedEntryIds.length > 0
            ? yield* dataPort.findJournalLinesByEntryIds(userId, validatedEntryIds)
            : [];

        const results: VatDeclarationResult[] = [];
        for (const input of inputs) {
          const result = yield* computeVatFromLines(
            input.period,
            input.regime,
            allLines,
            allEntries,
          );
          results.push(result);
        }

        return results;
      });

    return VatService.of({
      computeDeclaration,
      computeDeclarationsBatch,
    });
  }),
);
