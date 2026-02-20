import type { Monetary } from "monetary";
/** A user identifier — opaque string to avoid coupling to auth models */
export type UserId = string;
export type MonetaryAmount = Monetary<number>;
export type AccountTypeCode = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
export type AccountClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type JournalEntryStatusCode = "DRAFT" | "VALIDATED" | "CLOSED" | "CANCELLED";
export type JournalEntrySourceCode = "BANK_IMPORT" | "MANUAL" | "PERIOD_CLOSING" | "OPENING_BALANCE";
export type PcgAccountModel = {
    readonly code: string;
    readonly name: string;
    readonly class: AccountClass;
    readonly typeId: AccountTypeCode;
    readonly isDebitNormal: boolean;
    readonly parentCode: string | null;
    readonly isActive: boolean;
};
export type JournalEntryModel = {
    readonly id: number;
    readonly userId: UserId;
    readonly transactionId: number | null;
    readonly date: Date;
    readonly description: string;
    readonly reference: string | null;
    readonly sourceId: JournalEntrySourceCode;
    readonly statusId: JournalEntryStatusCode;
    readonly validatedAt: Date | null;
    readonly periodId: number | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};
export type JournalLineModel = {
    readonly id: number;
    readonly journalEntryId: number;
    readonly accountCode: string;
    readonly debitAmount: MonetaryAmount | null;
    readonly creditAmount: MonetaryAmount | null;
    readonly description: string | null;
    readonly vatCode: string | null;
    readonly sectorId: number | null;
    readonly taxeAssimileeType: string | null;
    readonly acciseType: string | null;
    readonly createdAt: Date;
};
export type CompleteJournalEntry = {
    readonly entry: JournalEntryModel;
    readonly lines: readonly JournalLineModel[];
};
export type CreateJournalEntryInput = {
    readonly userId: UserId;
    readonly transactionId?: number;
    readonly date: Date;
    readonly description: string;
    readonly reference?: string;
    readonly sourceId: JournalEntrySourceCode;
    readonly lines: readonly CreateJournalLineInput[];
};
export type CreateJournalLineInput = {
    readonly accountCode: string;
    readonly debitAmount?: MonetaryAmount;
    readonly creditAmount?: MonetaryAmount;
    readonly description?: string;
    readonly vatCode?: string;
};
export type AccountBalance = {
    readonly accountCode: string;
    readonly debitTotal: MonetaryAmount;
    readonly creditTotal: MonetaryAmount;
    readonly balance: MonetaryAmount;
};
export type Period = {
    readonly startDate: Date;
    readonly endDate: Date;
};
export type ActivityGroupCode = "BNC" | "BIC_SERVICES" | "BIC_GOODS";
export type TaxSystem = "IR" | "IS";
export type RegimeCode = "MICRO_ENTREPRISE" | "DECLARATION_CONTROLEE" | "REEL_SIMPLIFIE" | "REEL_NORMAL";
export declare function getAccountTypeFromClass(accountClass: AccountClass): AccountTypeCode;
export declare function isDebitNormal(typeId: AccountTypeCode): boolean;
//# sourceMappingURL=models.d.ts.map