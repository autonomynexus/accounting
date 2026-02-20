/**
 * Canonical VAT calculation formulas for French business.
 * All calculations use the monetary library to maintain precision.
 */
import type { Monetary, ScaledAmount } from "monetary";
export declare function calculateHTfromTTC(ttc: Monetary<number>, vatRate: ScaledAmount<number>): Monetary<number>;
export declare function calculateTTCfromHT(ht: Monetary<number>, vatRate: ScaledAmount<number>): Monetary<number>;
export declare function calculateVATfromTTC(ttc: Monetary<number>, vatRate: ScaledAmount<number>): Monetary<number>;
export declare function calculateVATfromHT(ht: Monetary<number>, vatRate: ScaledAmount<number>): Monetary<number>;
export declare const FRENCH_VAT_RATES: {
    readonly STANDARD: 20;
    readonly INTERMEDIATE: 10;
    readonly REDUCED: 5.5;
    readonly SUPER_REDUCED: 2.1;
    readonly EXEMPT: 0;
};
export declare function isValidFrenchVATRate(rate: number): boolean;
export type TaxableItem = {
    readonly amount: Monetary<number>;
    readonly taxRate: ScaledAmount<number> | null;
};
export type ItemTotals = {
    readonly totalHT: Monetary<number>;
    readonly totalTTC: Monetary<number>;
    readonly totalVAT: Monetary<number>;
};
export declare function calculateItemsTotals(items: TaxableItem[]): ItemTotals;
//# sourceMappingURL=calculations.d.ts.map