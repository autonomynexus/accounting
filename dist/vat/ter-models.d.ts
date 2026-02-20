/**
 * VAT TER Models (3310-TER)
 *
 * Domain types for "Secteurs d'Activité Distincts" annexe
 * Required when business has activities with different VAT deduction rights
 *
 * @see CGI Art. 271 - "Secteurs distincts d'activité"
 * @see docs/plans/vat-annexes-data-model.md
 */
import type { Monetary } from "monetary";
/**
 * VAT sector for multi-sector businesses
 * Defines a distinct activity with its own VAT deduction percentage
 */
export type VatSectorConfig = {
    readonly id: number;
    readonly code: string;
    readonly name: string;
    readonly deductionPercentage: number;
    readonly isActive: boolean;
    readonly effectiveFrom?: Date;
};
/**
 * Sector reference for TER declaration
 */
export type TerSector = {
    readonly id: number;
    readonly description: string;
    readonly deductionPercentage: number;
};
/**
 * TVA Brute per sector (columns 1-3 on TER form)
 */
export type TerSectorVatBrute = {
    readonly sectorId: number;
    readonly tvaBrute: Monetary<number>;
    readonly tvaAReverser: Monetary<number>;
    readonly total: Monetary<number>;
};
/**
 * TVA Déductible per sector (columns 4-9 on TER form)
 */
export type TerSectorTvaDeductible = {
    readonly sectorId: number;
    readonly immoExclusive: Monetary<number>;
    readonly immoNonExclusive: Monetary<number>;
    readonly immoTotal: Monetary<number>;
    readonly absExclusive: Monetary<number>;
    readonly absNonExclusive: Monetary<number>;
    readonly absTotal: Monetary<number>;
};
/**
 * Result calculation per sector (columns 10-13 on TER form)
 */
export type TerSectorResult = {
    readonly sectorId: number;
    readonly complementTvaDeductible: Monetary<number>;
    readonly totalTvaDeductible: Monetary<number>;
    readonly tvaNette: Monetary<number>;
    readonly creditTva: Monetary<number>;
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
    readonly generalDeductionPercentage: number;
    readonly sectors: readonly TerSector[];
    readonly vatBrute: readonly TerSectorVatBrute[];
    readonly vatDeductible: readonly TerSectorTvaDeductible[];
    readonly results: readonly TerSectorResult[];
    readonly totals: TerTotals;
    readonly mentionExpresse: boolean;
    readonly comments: readonly string[];
};
/**
 * Combined sector data (flattened for easier processing)
 */
export type TerSectorData = {
    readonly sectorId: number;
    readonly sectorNumber: number;
    readonly sector: TerSector;
    readonly vatBrute: TerSectorVatBrute;
    readonly vatDeductible: TerSectorTvaDeductible;
    readonly result: TerSectorResult;
};
import type { TerDeclarationSnapshot } from "./annexe-types.js";
/**
 * Convert TerDeclaration to storable snapshot
 */
export declare function toTerSnapshot(ter: TerDeclaration): TerDeclarationSnapshot;
/**
 * Convert snapshot back to TerDeclaration
 */
export declare function fromTerSnapshot(snapshot: TerDeclarationSnapshot, sectorConfigs: readonly VatSectorConfig[]): TerDeclaration;
//# sourceMappingURL=ter-models.d.ts.map