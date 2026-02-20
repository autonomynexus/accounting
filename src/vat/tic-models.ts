/**
 * VAT TIC Models (3310-TIC)
 *
 * Domain types for "Accises Produits Énergétiques" annexe
 * Energy excise taxes (electricity, gas, coal, other)
 *
 * @see docs/plans/vat-annexes-data-model.md
 */

import type { Monetary } from "@autonomynexus/monetary";
import { EUR, monetary } from "@autonomynexus/monetary";
import type {
  AcciseType,
  TicSectionType,
  TicExemptionCode,
  TicDeclarationSnapshot,
} from "./annexe-types.js";

// ============================================================================
// Types
// ============================================================================

/**
 * Human-readable labels for TIC exemption codes
 * E08-E22 per French tax code (CGI)
 */
export const TIC_EXEMPTION_LABELS: Record<TicExemptionCode, string> = {
  E08: "Électricité produite à bord des navires",
  E09: "Production d'électricité",
  E10: "Transport de personnes et marchandises",
  E11: "Production de produits énergétiques",
  E12: "Maintien de la capacité de production d'électricité",
  E13: "Électricité utilisée pour son propre fonctionnement",
  E14: "Électricité produite par petits producteurs",
  E15: "Électricité consommée pour des procédés métallurgiques",
  E16: "Électricité consommée pour des procédés d'électrolyse",
  E17: "Électricité utilisée pour le recyclage",
  E18: "Extraction de gaz naturel",
  E19: "Double usage du gaz naturel",
  E20: "Gaz naturel pour usage carburant",
  E21: "Usage comme matière première",
  E22: "Fabrication de produits minéraux non métalliques",
};

/**
 * Human-readable labels for accise types
 */
export const ACCISE_TYPE_LABELS: Record<AcciseType, string> = {
  TICFE: "Taxe intérieure sur la consommation finale d'électricité",
  TICGN: "Taxe intérieure sur la consommation de gaz naturel",
  TICC: "Taxe intérieure sur la consommation de charbon",
  TICPE: "Taxe intérieure sur la consommation de produits énergétiques",
};

// ============================================================================
// Meter/Delivery Point Types
// ============================================================================

/**
 * Energy meter or delivery point
 * Each meter represents a point of consumption
 */
export type TicMeter = {
  readonly id: number;
  readonly sectionType: TicSectionType;
  readonly reference: string; // Meter or point reference
  readonly siret: string | null; // SIRET of establishment (if different)
  readonly codeApe: string | null; // APE code for this meter
  readonly motifTarifReduit: TicExemptionCode | null; // Exemption code
  readonly closingDate: Date | null; // For closed meters
  readonly quantity: number; // Energy quantity
  readonly quantityScale: number; // Decimal places for quantity
  readonly rate: Monetary<number>; // Tax rate per unit
  readonly deductiblePortion: Monetary<number>; // Deductible amount
  readonly carryover: Monetary<number>; // Report from previous period
  readonly netDue: Monetary<number>; // Net tax due
  readonly details: Record<string, unknown>; // Section-specific fields
};

/**
 * Create a new meter with default values
 */
export function createEmptyMeter(
  sectionType: TicSectionType,
  reference: string,
): Omit<TicMeter, "id"> {
  const zeroEur = monetary({ amount: 0, currency: EUR });
  return {
    sectionType,
    reference,
    siret: null,
    codeApe: null,
    motifTarifReduit: null,
    closingDate: null,
    quantity: 0,
    quantityScale: 0,
    rate: zeroEur,
    deductiblePortion: zeroEur,
    carryover: zeroEur,
    netDue: zeroEur,
    details: {},
  };
}

// ============================================================================
// Section Types
// ============================================================================

/**
 * Base section for energy type
 */
type TicSectionBase = {
  readonly enabled: boolean;
  readonly meters: readonly TicMeter[];
  readonly totalQuantity: number;
  readonly totalTaxDue: Monetary<number>;
  readonly totalDeductible: Monetary<number>;
  readonly totalCarryover: Monetary<number>;
  readonly netDue: Monetary<number>;
};

/**
 * Electricity section (TICFE)
 */
export type TicElectricitySection = TicSectionBase & {
  readonly type: "ELECTRICITY";
  readonly acciseType: "TICFE";
};

/**
 * Gas section (TICGN)
 */
export type TicGasSection = TicSectionBase & {
  readonly type: "GAS";
  readonly acciseType: "TICGN";
};

/**
 * Coal section (TICC)
 */
export type TicCoalSection = TicSectionBase & {
  readonly type: "COAL";
  readonly acciseType: "TICC";
};

/**
 * Other energy products section (TICPE)
 */
export type TicOtherSection = TicSectionBase & {
  readonly type: "OTHER";
  readonly acciseType: "TICPE";
};

// ============================================================================
// Declaration Types
// ============================================================================

/**
 * Complete 3310-TIC declaration
 * Contains all energy excise taxes for the period
 */
export type TicDeclaration = {
  readonly electricityEnabled: boolean;
  readonly gasEnabled: boolean;
  readonly coalEnabled: boolean;
  readonly otherEnabled: boolean;
  readonly electricity: TicElectricitySection;
  readonly gas: TicGasSection;
  readonly coal: TicCoalSection;
  readonly other: TicOtherSection;
  readonly netBalanceDue: Monetary<number>; // Total tax due
  readonly netCreditRefund: Monetary<number>; // Total credit/refund
};

// ============================================================================
// Snapshot Conversion
// ============================================================================

/**
 * Convert TicDeclaration to storable snapshot
 */
export function toTicSnapshot(tic: TicDeclaration): TicDeclarationSnapshot {
  const allMeters: {
    readonly id: number;
    readonly sectionType: string;
    readonly reference: string;
    readonly siret: string | null;
    readonly codeApe: string | null;
    readonly motifTarifReduit: string | null;
    readonly closingDate: string | null;
    readonly quantity: number;
    readonly rate: number;
    readonly deductiblePortion: number;
    readonly carryover: number;
    readonly netDue: number;
    readonly details: Record<string, unknown>;
  }[] = [];

  const addMeters = (section: TicSectionBase) => {
    for (const meter of section.meters) {
      allMeters.push({
        id: meter.id,
        sectionType: meter.sectionType,
        reference: meter.reference,
        siret: meter.siret,
        codeApe: meter.codeApe,
        motifTarifReduit: meter.motifTarifReduit,
        closingDate: meter.closingDate?.toISOString() ?? null,
        quantity: meter.quantity,
        rate: meter.rate.amount,
        deductiblePortion: meter.deductiblePortion.amount,
        carryover: meter.carryover.amount,
        netDue: meter.netDue.amount,
        details: meter.details,
      });
    }
  };

  addMeters(tic.electricity);
  addMeters(tic.gas);
  addMeters(tic.coal);
  addMeters(tic.other);

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    electricityEnabled: tic.electricityEnabled,
    gasEnabled: tic.gasEnabled,
    coalEnabled: tic.coalEnabled,
    otherEnabled: tic.otherEnabled,
    netBalanceDue: tic.netBalanceDue.amount,
    netCreditRefund: tic.netCreditRefund.amount,
    meters: allMeters,
  };
}

/**
 * Helper to create zero monetary value
 */
const zeroEur = () => monetary({ amount: 0, currency: EUR });

/**
 * Create empty section
 */
function createEmptySection<
  T extends "ELECTRICITY" | "GAS" | "COAL" | "OTHER",
  A extends AcciseType,
>(type: T, acciseType: A): TicSectionBase & { type: T; acciseType: A } {
  return {
    type,
    acciseType,
    enabled: false,
    meters: [],
    totalQuantity: 0,
    totalTaxDue: zeroEur(),
    totalDeductible: zeroEur(),
    totalCarryover: zeroEur(),
    netDue: zeroEur(),
  };
}

/**
 * Convert snapshot back to TicDeclaration
 */
export function fromTicSnapshot(snapshot: TicDeclarationSnapshot): TicDeclaration {
  const parseMeters = (sectionType: TicSectionType): TicMeter[] => {
    return snapshot.meters
      .filter((m) => m.sectionType === sectionType)
      .map((m) => ({
        id: m.id,
        sectionType: m.sectionType as TicSectionType,
        reference: m.reference,
        siret: m.siret,
        codeApe: m.codeApe,
        motifTarifReduit: m.motifTarifReduit as TicExemptionCode | null,
        closingDate: m.closingDate ? new Date(m.closingDate) : null,
        quantity: m.quantity,
        quantityScale: 0, // Default, not stored in snapshot
        rate: monetary({ amount: m.rate, currency: EUR }),
        deductiblePortion: monetary({
          amount: m.deductiblePortion,
          currency: EUR,
        }),
        carryover: monetary({ amount: m.carryover, currency: EUR }),
        netDue: monetary({ amount: m.netDue, currency: EUR }),
        details: m.details,
      }));
  };

  const calculateSectionTotals = (
    meters: readonly TicMeter[],
  ): Pick<
    TicSectionBase,
    "totalQuantity" | "totalTaxDue" | "totalDeductible" | "totalCarryover" | "netDue"
  > => {
    let totalQuantity = 0;
    let totalTaxDue = 0;
    let totalDeductible = 0;
    let totalCarryover = 0;
    let netDue = 0;

    for (const meter of meters) {
      totalQuantity += meter.quantity;
      totalTaxDue += meter.rate.amount * meter.quantity;
      totalDeductible += meter.deductiblePortion.amount;
      totalCarryover += meter.carryover.amount;
      netDue += meter.netDue.amount;
    }

    return {
      totalQuantity,
      totalTaxDue: monetary({ amount: totalTaxDue, currency: EUR }),
      totalDeductible: monetary({ amount: totalDeductible, currency: EUR }),
      totalCarryover: monetary({ amount: totalCarryover, currency: EUR }),
      netDue: monetary({ amount: netDue, currency: EUR }),
    };
  };

  const electricityMeters = parseMeters("ELECTRICITY");
  const gasMeters = parseMeters("GAS");
  const coalMeters = parseMeters("COAL");
  const otherMeters = parseMeters("OTHER");

  return {
    electricityEnabled: snapshot.electricityEnabled,
    gasEnabled: snapshot.gasEnabled,
    coalEnabled: snapshot.coalEnabled,
    otherEnabled: snapshot.otherEnabled,
    electricity: {
      type: "ELECTRICITY",
      acciseType: "TICFE",
      enabled: snapshot.electricityEnabled,
      meters: electricityMeters,
      ...calculateSectionTotals(electricityMeters),
    },
    gas: {
      type: "GAS",
      acciseType: "TICGN",
      enabled: snapshot.gasEnabled,
      meters: gasMeters,
      ...calculateSectionTotals(gasMeters),
    },
    coal: {
      type: "COAL",
      acciseType: "TICC",
      enabled: snapshot.coalEnabled,
      meters: coalMeters,
      ...calculateSectionTotals(coalMeters),
    },
    other: {
      type: "OTHER",
      acciseType: "TICPE",
      enabled: snapshot.otherEnabled,
      meters: otherMeters,
      ...calculateSectionTotals(otherMeters),
    },
    netBalanceDue: monetary({ amount: snapshot.netBalanceDue, currency: EUR }),
    netCreditRefund: monetary({
      amount: snapshot.netCreditRefund,
      currency: EUR,
    }),
  };
}

/**
 * Create empty TIC declaration
 */
export function createEmptyTicDeclaration(): TicDeclaration {
  return {
    electricityEnabled: false,
    gasEnabled: false,
    coalEnabled: false,
    otherEnabled: false,
    electricity: createEmptySection("ELECTRICITY", "TICFE"),
    gas: createEmptySection("GAS", "TICGN"),
    coal: createEmptySection("COAL", "TICC"),
    other: createEmptySection("OTHER", "TICPE"),
    netBalanceDue: zeroEur(),
    netCreditRefund: zeroEur(),
  };
}

/**
 * Calculate net balance from all sections
 */
export function calculateTicNetBalance(tic: TicDeclaration): {
  netBalanceDue: Monetary<number>;
  netCreditRefund: Monetary<number>;
} {
  let totalDue = 0;

  if (tic.electricityEnabled) {
    totalDue += tic.electricity.netDue.amount;
  }
  if (tic.gasEnabled) {
    totalDue += tic.gas.netDue.amount;
  }
  if (tic.coalEnabled) {
    totalDue += tic.coal.netDue.amount;
  }
  if (tic.otherEnabled) {
    totalDue += tic.other.netDue.amount;
  }

  return {
    netBalanceDue: totalDue >= 0 ? monetary({ amount: totalDue, currency: EUR }) : zeroEur(),
    netCreditRefund:
      totalDue < 0 ? monetary({ amount: Math.abs(totalDue), currency: EUR }) : zeroEur(),
  };
}
