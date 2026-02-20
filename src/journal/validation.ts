import { Effect, Schema } from "effect";
import { add, EUR, isZero, monetary, subtract, type ScaledAmount } from "@autonomynexus/monetary";
import {
	BANK_ACCOUNT,
	VAT_COLLECTED_ACCOUNT,
	getVatDeductibleAccount,
} from "../chart-of-accounts.js";
import type { CreateJournalLineInput, MonetaryAmount } from "../models.js";
import { getVatInfo } from "../vat/utils.js";

// ============================================================================
// Types
// ============================================================================

export type { CreateJournalLineInput } from "../models.js";

export type CreateFromTransactionParams = {
	readonly amount: MonetaryAmount;
	readonly pcgAccountCode: string;
	readonly taxRate?: ScaledAmount<number> | null;
	readonly vatAmount?: MonetaryAmount;
	readonly isRevenue: boolean;
};

// ============================================================================
// Tagged Errors
// ============================================================================

export class DoubleEntryValidationError extends Schema.TaggedError<DoubleEntryValidationError>()(
	"DoubleEntryValidationError",
	{
		message: Schema.String,
		debitTotal: Schema.Unknown,
		creditTotal: Schema.Unknown,
	},
) {}

export class InvalidJournalLineError extends Schema.TaggedError<InvalidJournalLineError>()(
	"InvalidJournalLineError",
	{
		message: Schema.String,
	},
) {}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate double-entry bookkeeping rules for journal lines.
 * - At least 2 lines
 * - Each line has debit XOR credit (not both, not neither)
 * - Sum of debits = sum of credits
 * - Total must be positive
 */
export const validateDoubleEntry = (
	lines: readonly CreateJournalLineInput[],
): Effect.Effect<true, DoubleEntryValidationError | InvalidJournalLineError> =>
	Effect.gen(function* () {
		if (lines.length < 2) {
			return yield* new InvalidJournalLineError({
				message: "Journal entry must have at least 2 lines",
			});
		}

		const zero = monetary({ amount: 0, currency: EUR });
		let debitTotal = zero;
		let creditTotal = zero;

		for (const line of lines) {
			const hasDebit = line.debitAmount && !isZero(line.debitAmount);
			const hasCredit = line.creditAmount && !isZero(line.creditAmount);

			if (hasDebit && hasCredit) {
				return yield* new InvalidJournalLineError({
					message: `Line for account ${line.accountCode} has both debit and credit`,
				});
			}

			if (!(hasDebit || hasCredit)) {
				return yield* new InvalidJournalLineError({
					message: `Line for account ${line.accountCode} has neither debit nor credit`,
				});
			}

			if (hasDebit && line.debitAmount) {
				debitTotal = add(debitTotal, line.debitAmount);
			}
			if (hasCredit && line.creditAmount) {
				creditTotal = add(creditTotal, line.creditAmount);
			}
		}

		if (debitTotal.amount !== creditTotal.amount) {
			return yield* new DoubleEntryValidationError({
				message: `Debits (${debitTotal.amount}) do not equal credits (${creditTotal.amount})`,
				debitTotal,
				creditTotal,
			});
		}

		if (debitTotal.amount <= 0) {
			return yield* new DoubleEntryValidationError({
				message: "Entry total must be positive",
				debitTotal,
				creditTotal,
			});
		}

		return true as const;
	});

// ============================================================================
// Journal Line Builder
// ============================================================================

/**
 * Build journal lines from a bank transaction.
 * Handles revenue/expense with or without VAT, routing to correct PCG accounts.
 */
export function buildJournalLinesFromTransaction(
	params: CreateFromTransactionParams,
): CreateJournalLineInput[] {
	const { amount, pcgAccountCode, taxRate, vatAmount, isRevenue } = params;
	const lines: CreateJournalLineInput[] = [];

	const vatInfo = getVatInfo(taxRate, isRevenue);
	const hasVatAmount = vatAmount && vatAmount.amount > 0;

	if (isRevenue) {
		if (hasVatAmount) {
			const netAmount = subtract(amount, vatAmount);
			lines.push({
				accountCode: BANK_ACCOUNT,
				debitAmount: amount,
				description: "Encaissement",
			});
			lines.push({
				accountCode: pcgAccountCode,
				creditAmount: netAmount,
				description: "Produit HT",
			});
			lines.push({
				accountCode: VAT_COLLECTED_ACCOUNT,
				creditAmount: vatAmount,
				description: "TVA collectée",
				vatCode: vatInfo.code,
			});
		} else {
			lines.push({
				accountCode: BANK_ACCOUNT,
				debitAmount: amount,
				description: "Encaissement",
			});
			lines.push({
				accountCode: pcgAccountCode,
				creditAmount: amount,
				description: "Produit",
			});
		}
	} else if (hasVatAmount) {
		const vatDeductibleAccount = getVatDeductibleAccount(pcgAccountCode);
		const netAmount = subtract(amount, vatAmount);
		lines.push({
			accountCode: pcgAccountCode,
			debitAmount: netAmount,
			description: "Charge HT",
		});
		lines.push({
			accountCode: vatDeductibleAccount,
			debitAmount: vatAmount,
			description: "TVA déductible",
			vatCode: vatInfo.code,
		});
		lines.push({
			accountCode: BANK_ACCOUNT,
			creditAmount: amount,
			description: "Décaissement",
		});
	} else {
		lines.push({
			accountCode: pcgAccountCode,
			debitAmount: amount,
			description: "Charge",
		});
		lines.push({
			accountCode: BANK_ACCOUNT,
			creditAmount: amount,
			description: "Décaissement",
		});
	}

	return lines;
}
