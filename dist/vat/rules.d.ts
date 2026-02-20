/**
 * VAT rules for French business transactions according to PCG and French VAT regulations.
 */
export declare function getAutomaticVatRate(category: {
    pcg_account?: number | null;
    name: string;
}): number | null;
export declare function isVatExemptCategory(category: {
    pcg_account?: number | null;
    name: string;
}): boolean;
export type TaxRateOption = {
    value: string;
    label: string;
};
export declare function getTaxRateOptions(t: (key: string) => string): TaxRateOption[];
//# sourceMappingURL=rules.d.ts.map