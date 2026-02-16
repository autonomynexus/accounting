import type { Monetary } from "monetary";

// ============================================================================
// Core Domain Types
// ============================================================================

/** A user identifier — opaque string to avoid coupling to auth models */
export type UserId = string;

// Typed Monetary for convenience
export type MonetaryAmount = Monetary<number>;

// Account Types (PCG)
export type AccountTypeCode =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE";
export type AccountClass = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Journal Entry Status
export type JournalEntryStatusCode =
  | "DRAFT"
  | "VALIDATED"
  | "CLOSED"
  | "CANCELLED";

// Journal Entry Source
export type JournalEntrySourceCode =
  | "BANK_IMPORT"
  | "MANUAL"
  | "PERIOD_CLOSING"
  | "OPENING_BALANCE";

// Domain models
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
  readonly createdAt: Date;
};

// Complete journal entry with lines
export type CompleteJournalEntry = {
  readonly entry: JournalEntryModel;
  readonly lines: readonly JournalLineModel[];
};

// Input types for creating entries
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

// Account balance
export type AccountBalance = {
  readonly accountCode: string;
  readonly debitTotal: MonetaryAmount;
  readonly creditTotal: MonetaryAmount;
  readonly balance: MonetaryAmount;
};

// Period for queries
export type Period = {
  readonly startDate: Date;
  readonly endDate: Date;
};

// Activity group codes (French business activity classification)
export type ActivityGroupCode = "BNC" | "BIC_SERVICES" | "BIC_GOODS";

// Tax system (French)
export type TaxSystem = "IR" | "IS";

// Regime codes
export type RegimeCode =
  | "MICRO_ENTREPRISE"
  | "DECLARATION_CONTROLEE"
  | "REEL_SIMPLIFIE"
  | "REEL_NORMAL";

// Helper to get account type from class
export function getAccountTypeFromClass(
  accountClass: AccountClass,
): AccountTypeCode {
  switch (accountClass) {
    case 1:
      return "EQUITY";
    case 2:
    case 3:
    case 5:
      return "ASSET";
    case 4:
      return "ASSET"; // Mixed - handled per account
    case 6:
      return "EXPENSE";
    case 7:
      return "REVENUE";
    case 8:
      return "ASSET"; // Special
    default:
      return accountClass satisfies never;
  }
}

// Helper to check if account normally has debit balance
export function isDebitNormal(typeId: AccountTypeCode): boolean {
  return typeId === "ASSET" || typeId === "EXPENSE";
}
