/**
 * VAT TER Models (3310-TER)
 *
 * Domain types for "Secteurs d'Activité Distincts" annexe
 * Required when business has activities with different VAT deduction rights
 *
 * @see CGI Art. 271 - "Secteurs distincts d'activité"
 * @see docs/plans/vat-annexes-data-model.md
 */

import type { Monetary } from "@autonomynexus/monetary";

// ============================================================================
// Sector Configuration (Company-level)
// ============================================================================

/**
 * VAT sector for multi-sector businesses
 * Defines a distinct activity with its own VAT deduction percentage
 */
export type VatSectorConfig = {
  readonly id: number;
  readonly code: string; // User-defined code (e.g., "SECTOR_1")
  readonly name: string; // Descriptive name (e.g., "Activité de conseil")
  readonly deductionPercentage: number; // 0-100, 2 decimal places
  readonly isActive: boolean;
  readonly effectiveFrom?: Date; // When this config took effect (for audit trail)
};

// ============================================================================
// TER Declaration Types
// ============================================================================

/**
 * Sector reference for TER declaration
 */
export type TerSector = {
  readonly id: number;
  readonly description: string;
  readonly deductionPercentage: number; // 0-100, 2 decimals
};

/**
 * TVA Brute per sector (columns 1-3 on TER form)
 */
export type TerSectorVatBrute = {
  readonly sectorId: number;
  readonly tvaBrute: Monetary<number>; // col 1: TVA brute collectée
  readonly tvaAReverser: Monetary<number>; // col 2: TVA à reverser
  readonly total: Monetary<number>; // col 3 = 1+2
};

/**
 * TVA Déductible per sector (columns 4-9 on TER form)
 */
export type TerSectorTvaDeductible = {
  readonly sectorId: number;
  // Immobilisations (fixed assets)
  readonly immoExclusive: Monetary<number>; // col 4: Exclusive use
  readonly immoNonExclusive: Monetary<number>; // col 5: Non-exclusive use
  readonly immoTotal: Monetary<number>; // col 6 = 4+5
  // Autres Biens et Services (ABS)
  readonly absExclusive: Monetary<number>; // col 7: Exclusive use
  readonly absNonExclusive: Monetary<number>; // col 8: Non-exclusive use
  readonly absTotal: Monetary<number>; // col 9 = 7+8
};

/**
 * Result calculation per sector (columns 10-13 on TER form)
 */
export type TerSectorResult = {
  readonly sectorId: number;
  readonly complementTvaDeductible: Monetary<number>; // col 10: Complement TVA déductible
  readonly totalTvaDeductible: Monetary<number>; // col 11: Total déductible
  readonly tvaNette: Monetary<number>; // col 12: TVA nette due (if positive)
  readonly creditTva: Monetary<number>; // col 13: Crédit de TVA (if negative)
};

/**
 * Totals across all sectors (summary row)
 */
export type TerTotals = {
  readonly tvaBrute: Monetary<number>;
  readonly tvaAReverser: Monetary<number>;
  readonly totalBrute: Monetary<number>;
  readonly immoTotal: Monetary<number>;
  readonly absTotal: Monetary<number>;
  readonly complementTvaDeductible: Monetary<number>;
  readonly totalTvaDeductible: Monetary<number>;
  readonly tvaNette: Monetary<number>;
  readonly creditTva: Monetary<number>;
};

/**
 * Complete TER declaration
 * Full form data for 3310-TER annexe
 */
export type TerDeclaration = {
  readonly generalDeductionPercentage: number; // Overall coefficient
  readonly sectors: readonly TerSector[];
  readonly vatBrute: readonly TerSectorVatBrute[];
  readonly vatDeductible: readonly TerSectorTvaDeductible[];
  readonly results: readonly TerSectorResult[];
  readonly totals: TerTotals;
  readonly mentionExpresse: boolean; // Special mention required
  readonly comments: readonly string[]; // Additional comments
};

/**
 * Combined sector data (flattened for easier processing)
 */
export type TerSectorData = {
  readonly sectorId: number;
  readonly sectorNumber: number; // Display order (1-n)
  readonly sector: TerSector;
  readonly vatBrute: TerSectorVatBrute;
  readonly vatDeductible: TerSectorTvaDeductible;
  readonly result: TerSectorResult;
};

// ============================================================================
// Snapshot Conversion
// ============================================================================

import { EUR, monetary } from "@autonomynexus/monetary";
import type { TerDeclarationSnapshot } from "./annexe-types.js";

/**
 * Convert TerDeclaration to storable snapshot
 */
export function toTerSnapshot(ter: TerDeclaration): TerDeclarationSnapshot {
  const sectorsData: TerDeclarationSnapshot["sectors"] = ter.sectors.map((sector, index) => {
    const brute = ter.vatBrute.find((b) => b.sectorId === sector.id);
    const deductible = ter.vatDeductible.find((d) => d.sectorId === sector.id);
    const result = ter.results.find((r) => r.sectorId === sector.id);

    return {
      sectorId: sector.id,
      sectorNumber: index + 1,
      tvaBrute: brute?.tvaBrute.amount ?? 0,
      tvaAReverser: brute?.tvaAReverser.amount ?? 0,
      totalBrute: brute?.total.amount ?? 0,
      immoExclusive: deductible?.immoExclusive.amount ?? 0,
      immoNonExclusive: deductible?.immoNonExclusive.amount ?? 0,
      immoTotal: deductible?.immoTotal.amount ?? 0,
      absExclusive: deductible?.absExclusive.amount ?? 0,
      absNonExclusive: deductible?.absNonExclusive.amount ?? 0,
      absTotal: deductible?.absTotal.amount ?? 0,
      complementTva: result?.complementTvaDeductible.amount ?? 0,
      totalDeductible: result?.totalTvaDeductible.amount ?? 0,
      tvaNette: result?.tvaNette.amount ?? 0,
      creditTva: result?.creditTva.amount ?? 0,
    };
  });

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    generalDeductionPercentage: ter.generalDeductionPercentage,
    mentionExpresse: ter.mentionExpresse,
    comments: ter.comments,
    sectors: sectorsData,
    totals: {
      tvaBrute: ter.totals.tvaBrute.amount,
      totalDeductible: ter.totals.totalTvaDeductible.amount,
      tvaNette: ter.totals.tvaNette.amount,
      creditTva: ter.totals.creditTva.amount,
    },
  };
}

/**
 * Helper to create zero monetary value
 */
const zeroEur = () => monetary({ amount: 0, currency: EUR });

/**
 * Convert snapshot back to TerDeclaration
 */
export function fromTerSnapshot(
  snapshot: TerDeclarationSnapshot,
  sectorConfigs: readonly VatSectorConfig[],
): TerDeclaration {
  const sectors: TerSector[] = snapshot.sectors.map((s) => {
    const config = sectorConfigs.find((c) => c.id === s.sectorId);
    return {
      id: s.sectorId,
      description: config?.name ?? `Sector ${s.sectorNumber}`,
      deductionPercentage: config?.deductionPercentage ?? 100,
    };
  });

  const vatBrute: TerSectorVatBrute[] = snapshot.sectors.map((s) => ({
    sectorId: s.sectorId,
    tvaBrute: monetary({ amount: s.tvaBrute, currency: EUR }),
    tvaAReverser: monetary({ amount: s.tvaAReverser, currency: EUR }),
    total: monetary({ amount: s.totalBrute, currency: EUR }),
  }));

  const vatDeductible: TerSectorTvaDeductible[] = snapshot.sectors.map((s) => ({
    sectorId: s.sectorId,
    immoExclusive: monetary({ amount: s.immoExclusive, currency: EUR }),
    immoNonExclusive: monetary({ amount: s.immoNonExclusive, currency: EUR }),
    immoTotal: monetary({ amount: s.immoTotal, currency: EUR }),
    absExclusive: monetary({ amount: s.absExclusive, currency: EUR }),
    absNonExclusive: monetary({ amount: s.absNonExclusive, currency: EUR }),
    absTotal: monetary({ amount: s.absTotal, currency: EUR }),
  }));

  const results: TerSectorResult[] = snapshot.sectors.map((s) => ({
    sectorId: s.sectorId,
    complementTvaDeductible: monetary({
      amount: s.complementTva,
      currency: EUR,
    }),
    totalTvaDeductible: monetary({ amount: s.totalDeductible, currency: EUR }),
    tvaNette: monetary({ amount: s.tvaNette, currency: EUR }),
    creditTva: monetary({ amount: s.creditTva, currency: EUR }),
  }));

  const totals: TerTotals = {
    tvaBrute: monetary({ amount: snapshot.totals.tvaBrute, currency: EUR }),
    tvaAReverser: zeroEur(), // Calculate from sectors if needed
    totalBrute: monetary({ amount: snapshot.totals.tvaBrute, currency: EUR }),
    immoTotal: zeroEur(), // Calculate from sectors if needed
    absTotal: zeroEur(), // Calculate from sectors if needed
    complementTvaDeductible: zeroEur(),
    totalTvaDeductible: monetary({
      amount: snapshot.totals.totalDeductible,
      currency: EUR,
    }),
    tvaNette: monetary({ amount: snapshot.totals.tvaNette, currency: EUR }),
    creditTva: monetary({ amount: snapshot.totals.creditTva, currency: EUR }),
  };

  return {
    generalDeductionPercentage: snapshot.generalDeductionPercentage,
    sectors,
    vatBrute,
    vatDeductible,
    results,
    totals,
    mentionExpresse: snapshot.mentionExpresse,
    comments: [...snapshot.comments],
  };
}
