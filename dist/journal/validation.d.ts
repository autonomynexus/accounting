import { Effect, Schema } from "effect";
import { type ScaledAmount } from "monetary";
import type { CreateJournalLineInput, MonetaryAmount } from "../models.js";
export type { CreateJournalLineInput } from "../models.js";
export type CreateFromTransactionParams = {
    readonly amount: MonetaryAmount;
    readonly pcgAccountCode: string;
    readonly taxRate?: ScaledAmount<number> | null;
    readonly vatAmount?: MonetaryAmount;
    readonly isRevenue: boolean;
};
declare const DoubleEntryValidationError_base: Schema.TaggedErrorClass<DoubleEntryValidationError, "DoubleEntryValidationError", {
    readonly _tag: Schema.tag<"DoubleEntryValidationError">;
} & {
    message: typeof Schema.String;
    debitTotal: typeof Schema.Unknown;
    creditTotal: typeof Schema.Unknown;
}>;
export declare class DoubleEntryValidationError extends DoubleEntryValidationError_base {
}
declare const InvalidJournalLineError_base: Schema.TaggedErrorClass<InvalidJournalLineError, "InvalidJournalLineError", {
    readonly _tag: Schema.tag<"InvalidJournalLineError">;
} & {
    message: typeof Schema.String;
}>;
export declare class InvalidJournalLineError extends InvalidJournalLineError_base {
}
/**
 * Validate double-entry bookkeeping rules for journal lines.
 * - At least 2 lines
 * - Each line has debit XOR credit (not both, not neither)
 * - Sum of debits = sum of credits
 * - Total must be positive
 */
export declare const validateDoubleEntry: (lines: readonly CreateJournalLineInput[]) => Effect.Effect<true, DoubleEntryValidationError | InvalidJournalLineError>;
/**
 * Build journal lines from a bank transaction.
 * Handles revenue/expense with or without VAT, routing to correct PCG accounts.
 */
export declare function buildJournalLinesFromTransaction(params: CreateFromTransactionParams): CreateJournalLineInput[];
//# sourceMappingURL=validation.d.ts.map