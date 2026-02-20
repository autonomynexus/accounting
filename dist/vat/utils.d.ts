import type { ScaledAmount } from "monetary";
export type VatCode = "TVA20" | "TVA10" | "TVA55" | "TVA21" | "TVA0" | "TVA85" | "TVA21_DOM" | "TVA175" | "TVA105";
export declare function isValidVatCode(code: string | null | undefined): code is VatCode;
export declare function isDomTomVatCode(code: VatCode): boolean;
export declare const VAT_COLLECTED_ACCOUNT = "4457";
export declare const VAT_DEDUCTIBLE_ACCOUNT = "4456";
export type VatInfo = {
    readonly code: VatCode;
    readonly account: string;
};
export declare function getVatInfo(taxRate: ScaledAmount<number> | null | undefined, isRevenue: boolean): VatInfo;
export declare function hasVat(taxRate: ScaledAmount<number> | null | undefined): boolean;
export declare function getVatRatePercentage(code: VatCode): number;
//# sourceMappingURL=utils.d.ts.map