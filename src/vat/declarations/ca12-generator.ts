import { Effect, Layer, Schema } from "effect";
import { add, EUR, type Monetary, monetary, subtract } from "@autonomynexus/monetary";
import {
  VAT_COLLECTED_ACCOUNT,
  VAT_DEDUCTIBLE_ABS,
  VAT_DEDUCTIBLE_IMMOS,
} from "../../chart-of-accounts.js";
import type { JournalLineModel, Period } from "../../models.js";
import { JournalDataPort } from "../../ports/journal-data.port.js";
import type { VatCode } from "../utils.js";
import { isDomTomVatCode, isValidVatCode } from "../utils.js";
import type { Ca12Declaration, Ca12TvaLine, GenerateCa12Input } from "../models.js";

// ============================================================================
// Tagged Errors
// ============================================================================

export class Ca12GenerationError extends Schema.TaggedError<Ca12GenerationError>()(
  "Ca12GenerationError",
  { message: Schema.String },
) {}

// ============================================================================
// Service Interface
// ============================================================================

export type Ca12GeneratorServiceInterface = {
  readonly generate: (
    input: GenerateCa12Input,
  ) => Effect.Effect<Ca12Declaration, Ca12GenerationError>;
};

export class Ca12GeneratorService extends Effect.Tag("@accounting/Ca12GeneratorService")<
  Ca12GeneratorService,
  Ca12GeneratorServiceInterface
>() {}

// ============================================================================
// Helpers
// ============================================================================

const zeroMonetary = (): Monetary<number> => monetary({ amount: 0, currency: EUR });
const zeroTvaLine = (): Ca12TvaLine => ({ base: zeroMonetary(), tva: zeroMonetary() });

type VatCodeKey = "TVA20" | "TVA10" | "TVA55" | "TVA21" | "TVA0" | "DOM" | "other";

function vatCodeToKey(code: VatCode | null | undefined): VatCodeKey {
  if (!code) return "other";
  if (isDomTomVatCode(code)) return "DOM";
  switch (code) {
    case "TVA20":
    case "TVA10":
    case "TVA55":
    case "TVA21":
    case "TVA0":
      return code;
    default:
      return "other";
  }
}

// ============================================================================
// Service Implementation
// ============================================================================

export const Ca12GeneratorServiceLayer = Layer.effect(
  Ca12GeneratorService,
  Effect.gen(function* () {
    const journalData = yield* JournalDataPort;

    const generate: Ca12GeneratorServiceInterface["generate"] = (input) =>
      Effect.gen(function* () {
        const { userId, exercice, previousCredit, acompteJuillet, acompteDécembre } = input;

        if (exercice.startDate >= exercice.endDate) {
          return yield* new Ca12GenerationError({
            message: "Exercice start date must be before end date",
          });
        }

        const period: Period = { startDate: exercice.startDate, endDate: exercice.endDate };
        const entries = yield* journalData.findEntriesByPeriod(userId, period);
        const validatedEntryIds = entries
          .filter((e) => e.statusId === "VALIDATED")
          .map((e) => e.id);

        if (validatedEntryIds.length === 0) {
          return createEmptyCa12(exercice, previousCredit, acompteJuillet, acompteDécembre);
        }

        const allLines = yield* journalData.findLinesByEntryIds(userId, validatedEntryIds);

        const revenueByRate: Record<VatCodeKey, Monetary<number>> = {
          TVA20: zeroMonetary(),
          TVA10: zeroMonetary(),
          TVA55: zeroMonetary(),
          TVA21: zeroMonetary(),
          TVA0: zeroMonetary(),
          DOM: zeroMonetary(),
          other: zeroMonetary(),
        };
        const vatCollectedByRate: Record<VatCodeKey, Monetary<number>> = {
          TVA20: zeroMonetary(),
          TVA10: zeroMonetary(),
          TVA55: zeroMonetary(),
          TVA21: zeroMonetary(),
          TVA0: zeroMonetary(),
          DOM: zeroMonetary(),
          other: zeroMonetary(),
        };
        let vatDeductibleImmos = zeroMonetary();
        let vatDeductibleABS = zeroMonetary();

        const linesByEntry = new Map<number, JournalLineModel[]>();
        for (const line of allLines) {
          const entryLines = linesByEntry.get(line.journalEntryId) ?? [];
          entryLines.push(line as JournalLineModel);
          linesByEntry.set(line.journalEntryId, entryLines);
        }

        for (const [, entryLines] of linesByEntry) {
          const vatCollectedLine = entryLines.find(
            (l) => l.accountCode === VAT_COLLECTED_ACCOUNT && l.creditAmount,
          );
          const revenueLines = entryLines.filter(
            (l) => l.accountCode.startsWith("7") && l.creditAmount,
          );

          for (const revLine of revenueLines) {
            const vatCode = vatCollectedLine?.vatCode;
            const key = vatCodeToKey(isValidVatCode(vatCode) ? (vatCode as VatCode) : undefined);
            revenueByRate[key] = add(revenueByRate[key], revLine.creditAmount ?? zeroMonetary());
          }

          for (const line of entryLines) {
            if (line.accountCode === VAT_COLLECTED_ACCOUNT && line.creditAmount) {
              const key = vatCodeToKey(
                isValidVatCode(line.vatCode) ? (line.vatCode as VatCode) : undefined,
              );
              vatCollectedByRate[key] = add(vatCollectedByRate[key], line.creditAmount);
            }
            if (line.accountCode === VAT_DEDUCTIBLE_IMMOS && line.debitAmount)
              vatDeductibleImmos = add(vatDeductibleImmos, line.debitAmount);
            if (line.accountCode === VAT_DEDUCTIBLE_ABS && line.debitAmount)
              vatDeductibleABS = add(vatDeductibleABS, line.debitAmount);
          }
        }

        if (revenueByRate.other.amount !== 0 || vatCollectedByRate.other.amount !== 0) {
          return yield* new Ca12GenerationError({ message: "Unsupported VAT rates detected." });
        }

        const ligne5A: Ca12TvaLine = { base: revenueByRate.TVA20, tva: vatCollectedByRate.TVA20 };
        const ligne5B: Ca12TvaLine = { base: revenueByRate.TVA55, tva: vatCollectedByRate.TVA55 };
        const ligne5C: Ca12TvaLine = { base: revenueByRate.TVA10, tva: vatCollectedByRate.TVA10 };
        const ligne06: Ca12TvaLine = { base: revenueByRate.DOM, tva: vatCollectedByRate.DOM };
        const ligne07: Ca12TvaLine = { base: revenueByRate.TVA21, tva: vatCollectedByRate.TVA21 };

        const ligne19 = [ligne5A.tva, ligne5B.tva, ligne5C.tva, ligne06.tva, ligne07.tva].reduce(
          (sum, v) => add(sum, v),
          zeroMonetary(),
        );

        const ligne20 = vatDeductibleABS;
        const ligne22 = ligne20;
        const ligne23 = vatDeductibleImmos;
        const ligne24 = previousCredit ?? zeroMonetary();
        const ligne25 = [ligne22, ligne23, ligne24].reduce((sum, v) => add(sum, v), zeroMonetary());
        const ligne27 = ligne25;

        const netVat = subtract(ligne19, ligne27);
        const isCredit = netVat.amount < 0;
        const ligne28 = isCredit ? zeroMonetary() : netVat;
        const ligne29 = isCredit
          ? monetary({ amount: Math.abs(netVat.amount), currency: EUR })
          : zeroMonetary();

        const juillet = acompteJuillet ?? zeroMonetary();
        const décembre = acompteDécembre ?? zeroMonetary();
        const ligne30 = add(juillet, décembre);

        const afterAcomptes = subtract(ligne28, ligne30);
        const hasRemaining = afterAcomptes.amount > 0;
        const ligne33 = hasRemaining ? afterAcomptes : zeroMonetary();
        const ligne34 = hasRemaining
          ? zeroMonetary()
          : add(ligne29, monetary({ amount: Math.abs(afterAcomptes.amount), currency: EUR }));

        return {
          exerciceStart: exercice.startDate,
          exerciceEnd: exercice.endDate,
          ligne01: zeroMonetary(),
          ligne02: zeroMonetary(),
          ligne03: zeroMonetary(),
          ligne3A: zeroMonetary(),
          ligne04: zeroMonetary(),
          ligne5A,
          ligne5B,
          ligne5C,
          ligne06,
          ligne07,
          ligne08: zeroTvaLine(),
          ligne09: zeroTvaLine(),
          ligne10: zeroMonetary(),
          ligneAA: zeroMonetary(),
          ligneAB: zeroMonetary(),
          ligneAC: zeroMonetary(),
          ligne11: zeroMonetary(),
          ligne12: zeroMonetary(),
          ligne19,
          ligne20,
          ligne21: zeroMonetary(),
          ligne22,
          ligne23,
          ligne24,
          ligne25,
          ligne26: zeroMonetary(),
          ligne27,
          ligne28,
          ligne29,
          ligne30,
          ligne31: zeroMonetary(),
          ligne32: zeroMonetary(),
          ligne33,
          ligne34,
          acompteJuillet: juillet,
          acompteDécembre: décembre,
          baseAcomptesSuivants: ligne28,
        } satisfies Ca12Declaration;
      });

    return Ca12GeneratorService.of({ generate });
  }),
);

function createEmptyCa12(
  exercice: { startDate: Date; endDate: Date },
  previousCredit?: Monetary<number>,
  acompteJuillet?: Monetary<number>,
  acompteDécembre?: Monetary<number>,
): Ca12Declaration {
  const zero = zeroMonetary();
  const zeroLine = zeroTvaLine();
  const credit = previousCredit ?? zero;
  const juillet = acompteJuillet ?? zero;
  const décembre = acompteDécembre ?? zero;
  const totalAcomptes = add(juillet, décembre);

  return {
    exerciceStart: exercice.startDate,
    exerciceEnd: exercice.endDate,
    ligne01: zero,
    ligne02: zero,
    ligne03: zero,
    ligne3A: zero,
    ligne04: zero,
    ligne5A: zeroLine,
    ligne5B: zeroLine,
    ligne5C: zeroLine,
    ligne06: zeroLine,
    ligne07: zeroLine,
    ligne08: zeroLine,
    ligne09: zeroLine,
    ligne10: zero,
    ligneAA: zero,
    ligneAB: zero,
    ligneAC: zero,
    ligne11: zero,
    ligne12: zero,
    ligne19: zero,
    ligne20: zero,
    ligne21: zero,
    ligne22: zero,
    ligne23: zero,
    ligne24: credit,
    ligne25: credit,
    ligne26: zero,
    ligne27: credit,
    ligne28: zero,
    ligne29: credit,
    ligne30: totalAcomptes,
    ligne31: zero,
    ligne32: zero,
    ligne33: zero,
    ligne34: credit,
    acompteJuillet: juillet,
    acompteDécembre: décembre,
    baseAcomptesSuivants: zero,
  };
}
