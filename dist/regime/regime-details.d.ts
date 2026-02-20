import { type Monetary } from "monetary";
import type { ActivityGroupCode, RegimeCode, TaxSystem } from "../models.js";
export type ThresholdConfig = {
    min?: Monetary<number>;
    max: Monetary<number>;
};
export declare const MICRO_THRESHOLDS: {
    readonly BIC_GOODS: Monetary<number>;
    readonly BIC_SERVICES: Monetary<number>;
    readonly BNC: Monetary<number>;
};
export declare const VAT_THRESHOLDS: {
    readonly GOODS: Monetary<number>;
    readonly SERVICES: Monetary<number>;
};
export declare const REEL_SIMPLIFIE_THRESHOLDS: {
    readonly BIC_SERVICES: Monetary<number>;
    readonly BIC_GOODS: Monetary<number>;
};
export declare const NO_LIMIT: Monetary<number>;
export type Contribution = {
    code: string;
    name: string;
    rate: number;
    category: "social" | "tax" | "professional" | "other";
    isAffectedByACRE?: boolean;
    isOptional?: boolean;
};
export type DeclarationForm = {
    code: string;
    name: string;
    description: string;
    isRequired: boolean;
    condition?: "IR" | "IS";
};
export type AccountingRequirement = {
    name: string;
    description: string;
};
export type DeclarationRequirements = {
    forms: DeclarationForm[];
    deadline: {
        type: "fixed" | "relative";
        description: string;
    };
    mustBeElectronic: boolean;
    accountingRequirements: readonly AccountingRequirement[];
};
export type RegimeConfig = {
    name: string;
    regime: RegimeCode;
    validActivityGroupCodes: ActivityGroupCode[];
    isAutoEntrepreneur: boolean;
    taxSystem: {
        allowed: TaxSystem[];
        default: TaxSystem;
    };
    contributions?: Contribution[];
    thresholds: Partial<Record<ActivityGroupCode, ThresholdConfig>>;
    declarations: DeclarationRequirements;
};
export declare const REGIME_CONFIG: Record<RegimeCode, RegimeConfig>;
//# sourceMappingURL=regime-details.d.ts.map