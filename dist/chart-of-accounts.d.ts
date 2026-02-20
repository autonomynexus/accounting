import type { AccountClass, AccountTypeCode, PcgAccountModel } from "./models.js";
type PcgAccountDefinition = {
    code: string;
    name: string;
    class: AccountClass;
    typeId: AccountTypeCode;
    isDebitNormal: boolean;
    parentCode?: string;
};
export declare const PCG_ACCOUNTS: PcgAccountDefinition[];
/** Convert to insert-ready format */
export declare function getPcgAccountsForInsert(): PcgAccountModel[];
export declare function getAccountDefinition(code: string): PcgAccountDefinition | undefined;
export declare function getRevenueAccountCodes(): string[];
export declare function getExpenseAccountCodes(): string[];
export declare const VAT_DEDUCTIBLE_ACCOUNT = "4456";
export declare const VAT_DEDUCTIBLE_IMMOS = "44562";
export declare const VAT_DEDUCTIBLE_ABS = "44566";
export declare const VAT_COLLECTED_ACCOUNT = "4457";
export declare const OTHER_TAXES_ACCOUNT = "447";
export declare const BANK_ACCOUNT = "512";
export declare const CLIENT_ACCOUNT = "411";
export declare const BANK_COMMISSION_ACCOUNT = "6278";
export declare const FOREX_LOSS_ACCOUNT = "656";
export declare const FOREX_GAIN_ACCOUNT = "756";
export declare const DISCOUNT_ACCOUNT = "665";
export declare const PAYMENT_PROCESSOR_FEE_ACCOUNT = "6278";
/**
 * Get the appropriate VAT deductible account based on expense account class.
 * Class 2 (immobilisations) → 44562, everything else → 44566
 */
export declare function getVatDeductibleAccount(expenseAccountCode: string): string;
export {};
//# sourceMappingURL=chart-of-accounts.d.ts.map