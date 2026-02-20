/**
 * VAT TIC Models (3310-TIC)
 *
 * Domain types for "Accises Produits Énergétiques" annexe
 * Energy excise taxes (electricity, gas, coal, other)
 *
 * @see docs/plans/vat-annexes-data-model.md
 */
import type { Monetary } from "monetary";
import type { AcciseType, TicSectionType, TicExemptionCode, TicDeclarationSnapshot } from "./annexe-types.js";
/**
 * Human-readable labels for TIC exemption codes
 * E08-E22 per French tax code (CGI)
 */
export declare const TIC_EXEMPTION_LABELS: Record<TicExemptionCode, string>;
/**
 * Human-readable labels for accise types
 */
export declare const ACCISE_TYPE_LABELS: Record<AcciseType, string>;
/**
 * Energy meter or delivery point
 * Each meter represents a point of consumption
 */
export type TicMeter = {
    readonly id: number;
    readonly sectionType: TicSectionType;
    readonly reference: string;
    readonly siret: string | null;
    readonly codeApe: string | null;
    readonly motifTarifReduit: TicExemptionCode | null;
    readonly closingDate: Date | null;
    readonly quantity: number;
    readonly quantityScale: number;
    readonly rate: Monetary<number>;
    readonly deductiblePortion: Monetary<number>;
    readonly carryover: Monetary<number>;
    readonly netDue: Monetary<number>;
    readonly details: Record<string, unknown>;
};
/**
 * Create a new meter with default values
 */
export declare function createEmptyMeter(sectionType: TicSectionType, reference: string): Omit<TicMeter, "id">;
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
    readonly netBalanceDue: Monetary<number>;
    readonly netCreditRefund: Monetary<number>;
};
/**
 * Convert TicDeclaration to storable snapshot
 */
export declare function toTicSnapshot(tic: TicDeclaration): TicDeclarationSnapshot;
/**
 * Convert snapshot back to TicDeclaration
 */
export declare function fromTicSnapshot(snapshot: TicDeclarationSnapshot): TicDeclaration;
/**
 * Create empty TIC declaration
 */
export declare function createEmptyTicDeclaration(): TicDeclaration;
/**
 * Calculate net balance from all sections
 */
export declare function calculateTicNetBalance(tic: TicDeclaration): {
    netBalanceDue: Monetary<number>;
    netCreditRefund: Monetary<number>;
};
export {};
//# sourceMappingURL=tic-models.d.ts.map