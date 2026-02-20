/**
 * VAT A Models (3310-A)
 *
 * Domain types for "Taxes Assimilées" annexe
 * Contains all taxes collected alongside VAT
 *
 * @see docs/plans/vat-annexes-data-model.md
 */
import type { Monetary } from "monetary";
import type { TaxeAssimileeType, ADeclarationSnapshot } from "./annexe-types.js";
/**
 * Human-readable labels for tax types
 */
export declare const TAXE_ASSIMILEE_LABELS: Record<TaxeAssimileeType, string>;
/**
 * Simple tax line (base + calculated tax)
 * Used for most assimilated taxes
 */
export type SimpleTaxLine = {
    readonly taxType: TaxeAssimileeType;
    readonly enabled: boolean;
    readonly baseImposable: Monetary<number>;
    readonly taxeDue: Monetary<number>;
};
/**
 * Transport infrastructure tax with specific fields
 */
export type TransportInfrastructureTax = SimpleTaxLine & {
    readonly taxType: "TRANSPORT_INFRASTRUCTURE";
    readonly details: {
        readonly tonnage: number;
        readonly ratePerTon: Monetary<number>;
    };
};
/**
 * Videogram tax with advance payments
 */
export type VideogramTax = SimpleTaxLine & {
    readonly taxType: "VIDEOGRAMMES";
    readonly details: {
        readonly advancesPaid: Monetary<number>;
        readonly unitsSold: number;
        readonly ratePerUnit: Monetary<number>;
    };
};
/**
 * Electricity production margin tax
 */
export type ElectricityProductionMargin = SimpleTaxLine & {
    readonly taxType: "RENTE_ELECTRICITE";
    readonly details: {
        readonly productionMwh: number;
        readonly referencePriceEur: Monetary<number>;
        readonly actualPriceEur: Monetary<number>;
        readonly marginRate: number;
    };
};
/**
 * Complete 3310-A declaration
 * Contains all assimilated taxes for the period
 */
export type ADeclaration = {
    readonly taxes: readonly SimpleTaxLine[];
    readonly transportInfrastructure: TransportInfrastructureTax | null;
    readonly videogram: VideogramTax | null;
    readonly electricityProduction: ElectricityProductionMargin | null;
    readonly ligne29Total: Monetary<number>;
};
/**
 * Input for creating/updating A declaration
 */
export type ADeclarationInput = {
    readonly declarationId: number;
    readonly taxes: readonly {
        readonly taxType: TaxeAssimileeType;
        readonly enabled: boolean;
        readonly baseImposable: number;
        readonly taxeDue: number;
        readonly details?: Record<string, unknown>;
    }[];
};
/**
 * Convert ADeclaration to storable snapshot
 */
export declare function toASnapshot(a: ADeclaration): ADeclarationSnapshot;
/**
 * Convert snapshot back to ADeclaration
 */
export declare function fromASnapshot(snapshot: ADeclarationSnapshot): ADeclaration;
/**
 * Create empty A declaration
 */
export declare function createEmptyADeclaration(): ADeclaration;
/**
 * Calculate ligne 29 total from all taxes
 */
export declare function calculateLigne29Total(a: ADeclaration): Monetary<number>;
//# sourceMappingURL=annexe-a-models.d.ts.map