import { Effect, Layer, Schema } from "effect";
import { add, EUR, type Monetary, monetary, subtract } from "@autonomynexus/monetary";
import {
  VAT_COLLECTED_ACCOUNT,
  OTHER_TAXES_ACCOUNT,
  VAT_DEDUCTIBLE_ABS,
  VAT_DEDUCTIBLE_IMMOS,
} from "../../chart-of-accounts.js";
import type { JournalLineModel, Period, UserId } from "../../models.js";
import { JournalDataPort } from "../../ports/journal-data.port.js";
import { VatSectorPort } from "../../ports/vat-sector.port.js";
import type { VatSectorConfig } from "../ter-models.js";
import type { VatCode } from "../utils.js";
import { isDomTomVatCode, isValidVatCode } from "../utils.js";
import type { Ca3Declaration, Ca3TvaLine, GenerateCa3Input } from "../models.js";
import {
  calculateLigne29Total,
  type ADeclaration,
  type SimpleTaxLine,
} from "../annexe-a-models.js";
import type { TaxeAssimileeType } from "../annexe-types.js";
import type {
  TerDeclaration,
  TerSector,
  TerSectorResult,
  TerSectorTvaDeductible,
  TerSectorVatBrute,
  TerTotals,
} from "../ter-models.js";
import type {
  TicCoalSection,
  TicDeclaration,
  TicElectricitySection,
  TicGasSection,
  TicOtherSection,
} from "../tic-models.js";

// ============================================================================
// Tagged Errors
// ============================================================================

export class Ca3GenerationError extends Schema.TaggedError<Ca3GenerationError>()(
  "Ca3GenerationError",
  { message: Schema.String },
) {}

// ============================================================================
// Input Types for Annexe Generation
// ============================================================================

export type GenerateTerInput = {
  readonly userId: UserId;
  readonly period: Period;
};

export type GenerateAnnexeAInput = {
  readonly userId: UserId;
  readonly period: Period;
};

export type GenerateTicInput = {
  readonly userId: UserId;
  readonly period: Period;
};

// ============================================================================
// Service Interface
// ============================================================================

export type Ca3GeneratorServiceInterface = {
  readonly generate: (input: GenerateCa3Input) => Effect.Effect<Ca3Declaration, Ca3GenerationError>;

  readonly generateTer: (
    input: GenerateTerInput,
  ) => Effect.Effect<TerDeclaration | null, Ca3GenerationError, VatSectorPort>;

  readonly generateAnnexeA: (
    input: GenerateAnnexeAInput,
  ) => Effect.Effect<ADeclaration | null, Ca3GenerationError>;

  readonly generateTic: (
    input: GenerateTicInput,
  ) => Effect.Effect<TicDeclaration | null, Ca3GenerationError>;
};

export class Ca3GeneratorService extends Effect.Tag("@accounting/Ca3GeneratorService")<
  Ca3GeneratorService,
  Ca3GeneratorServiceInterface
>() {}

// ============================================================================
// Helpers
// ============================================================================

const zeroMonetary = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

const zeroTvaLine = (): Ca3TvaLine => ({
  base: zeroMonetary(),
  tva: zeroMonetary(),
});

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

export const Ca3GeneratorServiceLayer = Layer.effect(
  Ca3GeneratorService,
  Effect.gen(function* () {
    const journalData = yield* JournalDataPort;

    const getLines = (userId: UserId, period: Period) =>
      Effect.gen(function* () {
        const entries = yield* journalData.findEntriesByPeriod(userId, period);
        const validatedEntryIds = entries
          .filter((e) => e.statusId === "VALIDATED")
          .map((e) => e.id);
        if (validatedEntryIds.length === 0) return [];
        return yield* journalData.findLinesByEntryIds(userId, validatedEntryIds);
      });

    const generate: Ca3GeneratorServiceInterface["generate"] = (input) =>
      Effect.gen(function* () {
        const { userId, period, previousCredit } = input;

        const allLines = yield* getLines(userId, period);
        if (allLines.length === 0) return createEmptyCa3(previousCredit);

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

        // Group lines by entry
        const linesByEntry = new Map<number, JournalLineModel[]>();
        for (const line of allLines) {
          const entryLines = linesByEntry.get(line.journalEntryId) ?? [];
          entryLines.push(line);
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
            const amount = revLine.creditAmount ?? zeroMonetary();
            revenueByRate[key] = add(revenueByRate[key], amount);
          }

          for (const line of entryLines) {
            if (line.accountCode === VAT_COLLECTED_ACCOUNT && line.creditAmount) {
              const vatCode = line.vatCode;
              const key = vatCodeToKey(isValidVatCode(vatCode) ? (vatCode as VatCode) : undefined);
              vatCollectedByRate[key] = add(vatCollectedByRate[key], line.creditAmount);
            }
          }

          for (const line of entryLines) {
            if (line.accountCode === VAT_DEDUCTIBLE_IMMOS && line.debitAmount) {
              vatDeductibleImmos = add(vatDeductibleImmos, line.debitAmount);
            }
            if (line.accountCode === VAT_DEDUCTIBLE_ABS && line.debitAmount) {
              vatDeductibleABS = add(vatDeductibleABS, line.debitAmount);
            }
          }
        }

        if (revenueByRate.other.amount !== 0 || vatCollectedByRate.other.amount !== 0) {
          return yield* new Ca3GenerationError({
            message:
              "Unsupported VAT rates detected. Check that all transactions use valid French VAT rates.",
          });
        }

        const ligne01 = Object.values(revenueByRate).reduce(
          (sum, v) => add(sum, v),
          zeroMonetary(),
        );
        const ligne08: Ca3TvaLine = { base: revenueByRate.TVA20, tva: vatCollectedByRate.TVA20 };
        const ligne09: Ca3TvaLine = { base: revenueByRate.TVA55, tva: vatCollectedByRate.TVA55 };
        const ligne9B: Ca3TvaLine = { base: revenueByRate.TVA10, tva: vatCollectedByRate.TVA10 };
        const ligne10: Ca3TvaLine = { base: revenueByRate.DOM, tva: vatCollectedByRate.DOM };
        const ligne11: Ca3TvaLine = { base: revenueByRate.TVA21, tva: vatCollectedByRate.TVA21 };

        const ligne16 = [ligne08.tva, ligne09.tva, ligne9B.tva, ligne10.tva, ligne11.tva].reduce(
          (sum, v) => add(sum, v),
          zeroMonetary(),
        );

        const ligne19 = vatDeductibleABS;
        const ligne20 = vatDeductibleImmos;
        const ligne22 = previousCredit ?? zeroMonetary();
        const ligne23 = [ligne19, ligne20, ligne22].reduce((sum, v) => add(sum, v), zeroMonetary());

        const netVat = subtract(ligne16, ligne23);
        const isCredit = netVat.amount < 0;
        const ligne25 = isCredit
          ? monetary({ amount: Math.abs(netVat.amount), currency: EUR })
          : zeroMonetary();
        const ligne27 = ligne25;
        const ligne28 = isCredit ? zeroMonetary() : netVat;
        const ligne32 = ligne28;

        return {
          ligne01,
          ligne02: zeroMonetary(),
          ligne03: zeroMonetary(),
          ligne3A: zeroMonetary(),
          ligne3B: zeroMonetary(),
          ligne04: zeroMonetary(),
          ligne05: zeroMonetary(),
          ligne06: zeroMonetary(),
          ligne6A: zeroMonetary(),
          ligne07: zeroMonetary(),
          ligne08,
          ligne09,
          ligne9B,
          ligne10,
          ligne11,
          ligne13: zeroMonetary(),
          ligne14: zeroMonetary(),
          ligne15: zeroMonetary(),
          ligne16,
          ligne17: zeroMonetary(),
          ligne18: zeroMonetary(),
          ligne19,
          ligne20,
          ligne21: zeroMonetary(),
          ligne22,
          ligne23,
          ligne25,
          ligne26: zeroMonetary(),
          ligne27,
          ligne28,
          ligne29: zeroMonetary(),
          ligne30: zeroMonetary(),
          ligne31: zeroMonetary(),
          ligne32,
        } satisfies Ca3Declaration;
      });

    const generateTer: Ca3GeneratorServiceInterface["generateTer"] = (input) =>
      Effect.gen(function* () {
        const { userId, period } = input;
        const sectorPort = yield* VatSectorPort;
        const sectors = yield* sectorPort.getActiveSectors(userId);

        if (sectors.length <= 1) return null;

        const allLines = yield* getLines(userId, period);
        if (allLines.length === 0) return createEmptyTer(sectors);

        const sectorAccumulators = new Map<
          number,
          {
            tvaBrute: Monetary<number>;
            tvaAReverser: Monetary<number>;
            immoExclusive: Monetary<number>;
            immoNonExclusive: Monetary<number>;
            absExclusive: Monetary<number>;
            absNonExclusive: Monetary<number>;
          }
        >();

        for (const sector of sectors) {
          sectorAccumulators.set(sector.id, {
            tvaBrute: zeroMonetary(),
            tvaAReverser: zeroMonetary(),
            immoExclusive: zeroMonetary(),
            immoNonExclusive: zeroMonetary(),
            absExclusive: zeroMonetary(),
            absNonExclusive: zeroMonetary(),
          });
        }

        for (const line of allLines) {
          const sectorId = line.sectorId;
          if (!sectorId) continue;
          const acc = sectorAccumulators.get(sectorId);
          if (!acc) continue;

          if (line.accountCode === VAT_COLLECTED_ACCOUNT && line.creditAmount) {
            acc.tvaBrute = add(acc.tvaBrute, line.creditAmount);
          }
          if (line.accountCode === VAT_DEDUCTIBLE_IMMOS && line.debitAmount) {
            acc.immoExclusive = add(acc.immoExclusive, line.debitAmount);
          }
          if (line.accountCode === VAT_DEDUCTIBLE_ABS && line.debitAmount) {
            acc.absExclusive = add(acc.absExclusive, line.debitAmount);
          }
        }

        const terSectors: TerSector[] = sectors.map((s) => ({
          id: s.id,
          description: s.name,
          deductionPercentage: s.deductionPercentage,
        }));

        const emptyAcc = {
          tvaBrute: zeroMonetary(),
          tvaAReverser: zeroMonetary(),
          immoExclusive: zeroMonetary(),
          immoNonExclusive: zeroMonetary(),
          absExclusive: zeroMonetary(),
          absNonExclusive: zeroMonetary(),
        };

        const vatBrute: TerSectorVatBrute[] = sectors.map((s) => {
          const acc = sectorAccumulators.get(s.id) ?? emptyAcc;
          return {
            sectorId: s.id,
            tvaBrute: acc.tvaBrute,
            tvaAReverser: acc.tvaAReverser,
            total: add(acc.tvaBrute, acc.tvaAReverser),
          };
        });

        const vatDeductible: TerSectorTvaDeductible[] = sectors.map((s) => {
          const acc = sectorAccumulators.get(s.id) ?? emptyAcc;
          return {
            sectorId: s.id,
            immoExclusive: acc.immoExclusive,
            immoNonExclusive: acc.immoNonExclusive,
            immoTotal: add(acc.immoExclusive, acc.immoNonExclusive),
            absExclusive: acc.absExclusive,
            absNonExclusive: acc.absNonExclusive,
            absTotal: add(acc.absExclusive, acc.absNonExclusive),
          };
        });

        const results: TerSectorResult[] = sectors.map((s) => {
          const brute = vatBrute.find((b) => b.sectorId === s.id)!;
          const deduct = vatDeductible.find((d) => d.sectorId === s.id)!;
          const totalDeductible = add(deduct.immoTotal, deduct.absTotal);
          const net = subtract(brute.total, totalDeductible);
          const isCredit = net.amount < 0;
          return {
            sectorId: s.id,
            complementTvaDeductible: zeroMonetary(),
            totalTvaDeductible: totalDeductible,
            tvaNette: isCredit ? zeroMonetary() : net,
            creditTva: isCredit
              ? monetary({ amount: Math.abs(net.amount), currency: EUR })
              : zeroMonetary(),
          };
        });

        const totals = calculateTerTotals(vatBrute, vatDeductible, results);
        const generalDeductionPercentage = calculateGeneralDeductionPercentage(sectors, vatBrute);

        return {
          generalDeductionPercentage,
          sectors: terSectors,
          vatBrute,
          vatDeductible,
          results,
          totals,
          mentionExpresse: false,
          comments: [],
        };
      });

    const generateAnnexeA: Ca3GeneratorServiceInterface["generateAnnexeA"] = (input) =>
      Effect.gen(function* () {
        const { userId, period } = input;
        const allLines = yield* getLines(userId, period);
        if (allLines.length === 0) return null;

        const taxLines = allLines.filter(
          (line) =>
            line.accountCode === OTHER_TAXES_ACCOUNT && line.taxeAssimileeType && line.creditAmount,
        );
        if (taxLines.length === 0) return null;

        const taxAccumulators = new Map<
          string,
          { baseImposable: Monetary<number>; taxeDue: Monetary<number> }
        >();
        for (const line of taxLines) {
          const taxType = line.taxeAssimileeType!;
          const existing = taxAccumulators.get(taxType) ?? {
            baseImposable: zeroMonetary(),
            taxeDue: zeroMonetary(),
          };
          existing.taxeDue = add(existing.taxeDue, line.creditAmount!);
          taxAccumulators.set(taxType, existing);
        }

        const taxes: SimpleTaxLine[] = [];
        for (const [taxType, amounts] of taxAccumulators) {
          taxes.push({
            taxType: taxType as TaxeAssimileeType,
            enabled: true,
            baseImposable: amounts.baseImposable,
            taxeDue: amounts.taxeDue,
          });
        }

        const declaration: ADeclaration = {
          taxes,
          transportInfrastructure: null,
          videogram: null,
          electricityProduction: null,
          ligne29Total: calculateLigne29Total({
            taxes,
            transportInfrastructure: null,
            videogram: null,
            electricityProduction: null,
            ligne29Total: zeroMonetary(),
          }),
        };
        return declaration;
      });

    const generateTic: Ca3GeneratorServiceInterface["generateTic"] = (input) =>
      Effect.gen(function* () {
        const { userId, period } = input;
        const allLines = yield* getLines(userId, period);
        if (allLines.length === 0) return null;

        const acciseLines = allLines.filter(
          (line) =>
            line.accountCode === OTHER_TAXES_ACCOUNT && line.acciseType && line.creditAmount,
        );
        if (acciseLines.length === 0) return null;

        const acciseAccumulators = new Map<string, { netDue: Monetary<number> }>();
        for (const line of acciseLines) {
          const acciseType = line.acciseType!;
          const existing = acciseAccumulators.get(acciseType) ?? { netDue: zeroMonetary() };
          existing.netDue = add(existing.netDue, line.creditAmount!);
          acciseAccumulators.set(acciseType, existing);
        }

        const ticfeAmount = acciseAccumulators.get("TICFE")?.netDue ?? zeroMonetary();
        const ticgnAmount = acciseAccumulators.get("TICGN")?.netDue ?? zeroMonetary();
        const ticcAmount = acciseAccumulators.get("TICC")?.netDue ?? zeroMonetary();
        const ticpeAmount = acciseAccumulators.get("TICPE")?.netDue ?? zeroMonetary();

        const mkSection = <T extends string>(
          type: T,
          acciseType: string,
          amount: Monetary<number>,
        ) => ({
          type,
          acciseType,
          enabled: amount.amount > 0,
          meters: [] as never[],
          totalQuantity: 0,
          totalTaxDue: amount,
          totalDeductible: zeroMonetary(),
          totalCarryover: zeroMonetary(),
          netDue: amount,
        });

        const electricity = mkSection("ELECTRICITY", "TICFE", ticfeAmount) as TicElectricitySection;
        const gas = mkSection("GAS", "TICGN", ticgnAmount) as TicGasSection;
        const coal = mkSection("COAL", "TICC", ticcAmount) as TicCoalSection;
        const other = mkSection("OTHER", "TICPE", ticpeAmount) as TicOtherSection;

        const totalNetDue =
          ticfeAmount.amount + ticgnAmount.amount + ticcAmount.amount + ticpeAmount.amount;

        return {
          electricityEnabled: electricity.enabled,
          gasEnabled: gas.enabled,
          coalEnabled: coal.enabled,
          otherEnabled: other.enabled,
          electricity,
          gas,
          coal,
          other,
          netBalanceDue:
            totalNetDue >= 0 ? monetary({ amount: totalNetDue, currency: EUR }) : zeroMonetary(),
          netCreditRefund:
            totalNetDue < 0
              ? monetary({ amount: Math.abs(totalNetDue), currency: EUR })
              : zeroMonetary(),
        } satisfies TicDeclaration;
      });

    return Ca3GeneratorService.of({ generate, generateTer, generateAnnexeA, generateTic });
  }),
);

// ============================================================================
// Helper Functions
// ============================================================================

function createEmptyTer(sectors: readonly VatSectorConfig[]): TerDeclaration {
  const terSectors: TerSector[] = sectors.map((s) => ({
    id: s.id,
    description: s.name,
    deductionPercentage: s.deductionPercentage,
  }));
  const vatBrute: TerSectorVatBrute[] = sectors.map((s) => ({
    sectorId: s.id,
    tvaBrute: zeroMonetary(),
    tvaAReverser: zeroMonetary(),
    total: zeroMonetary(),
  }));
  const vatDeductible: TerSectorTvaDeductible[] = sectors.map((s) => ({
    sectorId: s.id,
    immoExclusive: zeroMonetary(),
    immoNonExclusive: zeroMonetary(),
    immoTotal: zeroMonetary(),
    absExclusive: zeroMonetary(),
    absNonExclusive: zeroMonetary(),
    absTotal: zeroMonetary(),
  }));
  const results: TerSectorResult[] = sectors.map((s) => ({
    sectorId: s.id,
    complementTvaDeductible: zeroMonetary(),
    totalTvaDeductible: zeroMonetary(),
    tvaNette: zeroMonetary(),
    creditTva: zeroMonetary(),
  }));
  return {
    generalDeductionPercentage: 100,
    sectors: terSectors,
    vatBrute,
    vatDeductible,
    results,
    totals: {
      tvaBrute: zeroMonetary(),
      tvaAReverser: zeroMonetary(),
      totalBrute: zeroMonetary(),
      immoTotal: zeroMonetary(),
      absTotal: zeroMonetary(),
      complementTvaDeductible: zeroMonetary(),
      totalTvaDeductible: zeroMonetary(),
      tvaNette: zeroMonetary(),
      creditTva: zeroMonetary(),
    },
    mentionExpresse: false,
    comments: [],
  };
}

function calculateTerTotals(
  vatBrute: TerSectorVatBrute[],
  vatDeductible: TerSectorTvaDeductible[],
  results: TerSectorResult[],
): TerTotals {
  let tvaBruteT = zeroMonetary(),
    tvaAReverser = zeroMonetary(),
    totalBrute = zeroMonetary();
  let immoTotal = zeroMonetary(),
    absTotal = zeroMonetary();
  let complementTvaDeductible = zeroMonetary(),
    totalTvaDeductible = zeroMonetary();
  let tvaNette = zeroMonetary(),
    creditTva = zeroMonetary();

  for (const b of vatBrute) {
    tvaBruteT = add(tvaBruteT, b.tvaBrute);
    tvaAReverser = add(tvaAReverser, b.tvaAReverser);
    totalBrute = add(totalBrute, b.total);
  }
  for (const d of vatDeductible) {
    immoTotal = add(immoTotal, d.immoTotal);
    absTotal = add(absTotal, d.absTotal);
  }
  for (const r of results) {
    complementTvaDeductible = add(complementTvaDeductible, r.complementTvaDeductible);
    totalTvaDeductible = add(totalTvaDeductible, r.totalTvaDeductible);
    tvaNette = add(tvaNette, r.tvaNette);
    creditTva = add(creditTva, r.creditTva);
  }

  return {
    tvaBrute: tvaBruteT,
    tvaAReverser,
    totalBrute,
    immoTotal,
    absTotal,
    complementTvaDeductible,
    totalTvaDeductible,
    tvaNette,
    creditTva,
  };
}

function calculateGeneralDeductionPercentage(
  sectors: readonly VatSectorConfig[],
  vatBrute: TerSectorVatBrute[],
): number {
  const totalVat = vatBrute.reduce((sum, b) => sum + b.tvaBrute.amount, 0);
  if (totalVat === 0) {
    const sum = sectors.reduce((s, sec) => s + sec.deductionPercentage, 0);
    return sectors.length > 0 ? sum / sectors.length : 100;
  }
  let weighted = 0;
  for (const sector of sectors) {
    const brute = vatBrute.find((b) => b.sectorId === sector.id);
    if (brute) weighted += sector.deductionPercentage * brute.tvaBrute.amount;
  }
  return weighted / totalVat;
}

function createEmptyCa3(previousCredit?: Monetary<number>): Ca3Declaration {
  const zero = zeroMonetary();
  const zeroLine = zeroTvaLine();
  const credit = previousCredit ?? zero;
  return {
    ligne01: zero,
    ligne02: zero,
    ligne03: zero,
    ligne3A: zero,
    ligne3B: zero,
    ligne04: zero,
    ligne05: zero,
    ligne06: zero,
    ligne6A: zero,
    ligne07: zero,
    ligne08: zeroLine,
    ligne09: zeroLine,
    ligne9B: zeroLine,
    ligne10: zeroLine,
    ligne11: zeroLine,
    ligne13: zero,
    ligne14: zero,
    ligne15: zero,
    ligne16: zero,
    ligne17: zero,
    ligne18: zero,
    ligne19: zero,
    ligne20: zero,
    ligne21: zero,
    ligne22: credit,
    ligne23: credit,
    ligne25: credit,
    ligne26: zero,
    ligne27: credit,
    ligne28: zero,
    ligne29: zero,
    ligne30: zero,
    ligne31: zero,
    ligne32: zero,
  };
}
