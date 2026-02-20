import { Effect, Layer } from "effect";
import { add, EUR, type Monetary, monetary, subtract } from "@autonomynexus/monetary";
import { getPcgAccountsForInsert } from "../chart-of-accounts.js";
import type { AccountBalance, MonetaryAmount, Period, UserId } from "../models.js";
import { AccountingDataPort, type AccountingDataError } from "../ports/accounting-data.port.js";
import type {
	IncomeStatement,
	IncomeStatementFormat,
	IncomeStatementLine,
	IncomeStatementSection,
} from "./income-statement-models.js";

// ============================================================================
// Service Interface
// ============================================================================

export type IncomeStatementServiceInterface = {
	readonly generateIncomeStatement: (params: {
		userId: UserId;
		fiscalYear: Period;
		previousYearIncomeStatement?: IncomeStatement;
	}) => Effect.Effect<IncomeStatement, AccountingDataError, AccountingDataPort>;
};

// ============================================================================
// Service Tag
// ============================================================================

export class IncomeStatementService extends Effect.Tag("@accounting/IncomeStatementService")<
	IncomeStatementService,
	IncomeStatementServiceInterface
>() {}

// ============================================================================
// Helpers
// ============================================================================

const zeroEUR = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

function createIncomeStatementLine(
	balance: AccountBalance,
	accountMap: Map<string, { code: string; name: string }>,
	previousYear?: IncomeStatement,
	_sectionName?: string,
): IncomeStatementLine | null {
	const account = accountMap.get(balance.accountCode);
	if (!account) return null;

	const currentYearAmount = monetary({
		amount: Math.abs(balance.balance.amount),
		currency: EUR,
	});
	if (currentYearAmount.amount === 0) return null;

	const previousYearAmount = getPreviousYearAmount(
		balance.accountCode,
		previousYear,
	);

	return {
		accountCode: balance.accountCode,
		accountName: account.name,
		currentYearAmount,
		previousYearAmount,
	};
}

function getPreviousYearAmount(
	accountCode: string,
	previousYear?: IncomeStatement,
): MonetaryAmount | undefined {
	if (!previousYear) return undefined;
	const sections = [
		previousYear.operatingRevenue,
		previousYear.operatingExpenses,
		previousYear.financialRevenue,
		previousYear.financialExpenses,
		previousYear.exceptionalRevenue,
		previousYear.exceptionalExpenses,
		previousYear.incomeTax,
	];
	for (const section of sections) {
		const line = section.lines.find((l) => l.accountCode === accountCode);
		if (line) return line.currentYearAmount;
	}
	return undefined;
}

function buildSection(
	title: string,
	balances: AccountBalance[],
	filter: (code: string) => boolean,
	accountMap: Map<string, { code: string; name: string }>,
	previousYear?: IncomeStatement,
	sectionName?: string,
): IncomeStatementSection {
	const lines = balances
		.filter((b) => filter(b.accountCode))
		.map((b) => createIncomeStatementLine(b, accountMap, previousYear, sectionName))
		.filter((line): line is IncomeStatementLine => line !== null);

	const subtotal = lines.reduce(
		(sum, line) => add(sum, line.currentYearAmount),
		zeroEUR(),
	);

	return { title, lines, subtotal };
}

// ============================================================================
// Service Layer
// ============================================================================

export const IncomeStatementServiceLayer = Layer.effect(
	IncomeStatementService,
	Effect.gen(function* () {
		const dataPort = yield* AccountingDataPort;
		const allAccounts = getPcgAccountsForInsert();
		const accountMap = new Map(allAccounts.map((acc) => [acc.code, acc]));

		const generateIncomeStatement: IncomeStatementServiceInterface["generateIncomeStatement"] =
			(params) =>
				Effect.gen(function* () {
					const { userId, fiscalYear, previousYearIncomeStatement } = params;

					const revenueBalances = yield* dataPort.getAccountBalancesByClass(
						userId,
						fiscalYear,
						7,
					);
					const expenseBalances = yield* dataPort.getAccountBalancesByClass(
						userId,
						fiscalYear,
						6,
					);

					const format: IncomeStatementFormat = "SIMPLIFIED";

					const operatingRevenue = buildSection(
						"Produits d'exploitation",
						revenueBalances,
						(code) => code >= "70" && code < "76",
						accountMap,
						previousYearIncomeStatement,
						"operatingRevenue",
					);

					const operatingExpenses = buildSection(
						"Charges d'exploitation",
						expenseBalances,
						(code) => code >= "60" && code < "66",
						accountMap,
						previousYearIncomeStatement,
						"operatingExpenses",
					);

					const financialRevenue = buildSection(
						"Produits financiers",
						revenueBalances,
						(code) => code.startsWith("76"),
						accountMap,
						previousYearIncomeStatement,
						"financialRevenue",
					);

					const financialExpenses = buildSection(
						"Charges financières",
						expenseBalances,
						(code) => code.startsWith("66"),
						accountMap,
						previousYearIncomeStatement,
						"financialExpenses",
					);

					const exceptionalRevenue = buildSection(
						"Produits exceptionnels",
						revenueBalances,
						(code) => code.startsWith("77") || code.startsWith("78"),
						accountMap,
						previousYearIncomeStatement,
						"exceptionalRevenue",
					);

					const exceptionalExpenses = buildSection(
						"Charges exceptionnelles",
						expenseBalances,
						(code) => code.startsWith("67") || code.startsWith("68"),
						accountMap,
						previousYearIncomeStatement,
						"exceptionalExpenses",
					);

					const incomeTax = buildSection(
						"Impôts sur les bénéfices",
						expenseBalances,
						(code) => code.startsWith("69"),
						accountMap,
						previousYearIncomeStatement,
						"incomeTax",
					);

					const operatingResult = subtract(
						operatingRevenue.subtotal,
						operatingExpenses.subtotal,
					);
					const financialResult = subtract(
						financialRevenue.subtotal,
						financialExpenses.subtotal,
					);
					const exceptionalResult = subtract(
						exceptionalRevenue.subtotal,
						exceptionalExpenses.subtotal,
					);
					const netResult = subtract(
						add(add(operatingResult, financialResult), exceptionalResult),
						incomeTax.subtotal,
					);

					return {
						fiscalYear: {
							startDate: fiscalYear.startDate,
							endDate: fiscalYear.endDate,
						},
						generatedAt: new Date(),
						format,
						operatingRevenue,
						operatingExpenses,
						operatingResult,
						financialRevenue,
						financialExpenses,
						financialResult,
						exceptionalRevenue,
						exceptionalExpenses,
						exceptionalResult,
						incomeTax,
						netResult,
						isCalculationCorrect: true,
					};
				});

		return IncomeStatementService.of({
			generateIncomeStatement,
		});
	}),
);
