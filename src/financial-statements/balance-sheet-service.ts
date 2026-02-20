import { Effect, Layer } from "effect";
import { add, compare, EUR, type Monetary, monetary, subtract } from "@autonomynexus/monetary";
import { getPcgAccountsForInsert } from "../chart-of-accounts.js";
import type { AccountBalance, Period, UserId } from "../models.js";
import { AccountingDataPort, type AccountingDataError } from "../ports/accounting-data.port.js";
import type {
	BalanceSheet,
	BalanceSheetFormat,
	BalanceSheetLine,
} from "./balance-sheet-models.js";

// ============================================================================
// Service Interface
// ============================================================================

export type BalanceSheetServiceInterface = {
	readonly generateBalanceSheet: (params: {
		userId: UserId;
		fiscalYearStart: Date;
		fiscalYearEnd: Date;
		previousYearBalanceSheet?: BalanceSheet;
	}) => Effect.Effect<BalanceSheet, AccountingDataError, AccountingDataPort>;

	readonly validateBalanceSheet: (
		balanceSheet: BalanceSheet,
	) => Effect.Effect<string[], never>;
};

// ============================================================================
// Service Tag
// ============================================================================

export class BalanceSheetService extends Effect.Tag("@accounting/BalanceSheetService")<
	BalanceSheetService,
	BalanceSheetServiceInterface
>() {}

// ============================================================================
// Helpers
// ============================================================================

const zeroMonetary = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

const createBalanceSheetLines = (
	accounts: Array<{ code: string; name: string; isDebitNormal: boolean }>,
	balances: AccountBalance[],
	previousYearBalanceSheet?: BalanceSheet,
): BalanceSheetLine[] => {
	const balanceMap = new Map(balances.map((b) => [b.accountCode, b.balance]));

	const getPreviousYearAmount = (accountCode: string): Monetary<number> | undefined => {
		if (!previousYearBalanceSheet) return undefined;
		const allLines = [
			...previousYearBalanceSheet.assets.fixedAssets.lines,
			...previousYearBalanceSheet.assets.currentAssets.lines,
			...previousYearBalanceSheet.liabilities.equity.lines,
			...previousYearBalanceSheet.liabilities.provisions.lines,
			...previousYearBalanceSheet.liabilities.debts.lines,
		];
		const line = allLines.find((l) => l.accountCode === accountCode);
		return line?.currentYearAmount;
	};

	return accounts
		.filter((account) => {
			const balance = balanceMap.get(account.code);
			return balance && Math.abs(balance.amount) >= 1;
		})
		.map((account) => {
			const currentYearAmount = balanceMap.get(account.code) ?? zeroMonetary();
			const previousYearAmount = getPreviousYearAmount(account.code);
			return {
				accountCode: account.code,
				accountName: account.name,
				currentYearAmount: {
					...currentYearAmount,
					amount: Math.abs(currentYearAmount.amount),
				},
				previousYearAmount,
				note: undefined,
			};
		})
		.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
};

const sumLines = (lines: readonly BalanceSheetLine[]): Monetary<number> =>
	lines.reduce((total, line) => add(total, line.currentYearAmount), zeroMonetary());

// ============================================================================
// Service Layer
// ============================================================================

export const BalanceSheetServiceLayer = Layer.effect(
	BalanceSheetService,
	Effect.gen(function* () {
		const dataPort = yield* AccountingDataPort;
		const allAccounts = getPcgAccountsForInsert();

		const generateBalanceSheet: BalanceSheetServiceInterface["generateBalanceSheet"] = (
			params,
		) =>
			Effect.gen(function* () {
				const { userId, fiscalYearStart, fiscalYearEnd, previousYearBalanceSheet } = params;
				const period: Period = { startDate: fiscalYearStart, endDate: fiscalYearEnd };

				const balances = yield* dataPort.getAccountBalances(userId, period);

				const format: BalanceSheetFormat = "SIMPLIFIED";

				// Assets
				const fixedAssetAccounts = allAccounts.filter(
					(a) => a.class === 2 && a.typeId === "ASSET",
				);
				const fixedAssetLines = createBalanceSheetLines(
					fixedAssetAccounts,
					balances,
					previousYearBalanceSheet,
				);
				const fixedAssetsTotal = sumLines(fixedAssetLines);

				const currentAssetAccounts = allAccounts.filter(
					(a) => (a.class === 3 || a.class === 4 || a.class === 5) && a.typeId === "ASSET",
				);
				const currentAssetLines = createBalanceSheetLines(
					currentAssetAccounts,
					balances,
					previousYearBalanceSheet,
				);
				const currentAssetsTotal = sumLines(currentAssetLines);

				const assets: BalanceSheet["assets"] = {
					fixedAssets: {
						title: "Actif immobilisé",
						lines: fixedAssetLines,
						subtotal: fixedAssetsTotal,
					},
					currentAssets: {
						title: "Actif circulant",
						lines: currentAssetLines,
						subtotal: currentAssetsTotal,
					},
					totalAssets: add(fixedAssetsTotal, currentAssetsTotal),
				};

				// Liabilities
				const equityAccounts = allAccounts.filter(
					(a) => a.class === 1 && a.typeId === "EQUITY",
				);
				const equityLines = createBalanceSheetLines(
					equityAccounts,
					balances,
					previousYearBalanceSheet,
				);
				const equityTotal = sumLines(equityLines);

				const provisionAccounts = allAccounts.filter(
					(a) => a.class === 1 && a.code.startsWith("15"),
				);
				const provisionLines = createBalanceSheetLines(
					provisionAccounts,
					balances,
					previousYearBalanceSheet,
				);
				const provisionsTotal = sumLines(provisionLines);

				const debtAccounts = allAccounts.filter(
					(a) =>
						(a.class === 1 && a.typeId === "LIABILITY") ||
						(a.class === 4 && a.typeId === "LIABILITY"),
				);
				const debtLines = createBalanceSheetLines(
					debtAccounts,
					balances,
					previousYearBalanceSheet,
				);
				const debtsTotal = sumLines(debtLines);

				const liabilities: BalanceSheet["liabilities"] = {
					equity: {
						title: "Capitaux propres",
						lines: equityLines,
						subtotal: equityTotal,
					},
					provisions: {
						title: "Provisions pour risques et charges",
						lines: provisionLines,
						subtotal: provisionsTotal,
					},
					debts: {
						title: "Dettes",
						lines: debtLines,
						subtotal: debtsTotal,
					},
					totalLiabilities: add(add(equityTotal, provisionsTotal), debtsTotal),
				};

				const balanceDifference = subtract(assets.totalAssets, liabilities.totalLiabilities);
				const isBalanced = Math.abs(balanceDifference.amount) < 1;

				return {
					fiscalYear: { startDate: fiscalYearStart, endDate: fiscalYearEnd },
					generatedAt: new Date(),
					format,
					assets,
					liabilities,
					isBalanced,
					balanceDifference,
				};
			});

		const validateBalanceSheet: BalanceSheetServiceInterface["validateBalanceSheet"] = (
			balanceSheet,
		) =>
			Effect.sync(() => {
				const errors: string[] = [];
				if (!balanceSheet.isBalanced) {
					const differenceEur = balanceSheet.balanceDifference.amount / 100;
					errors.push(
						`Balance sheet is not balanced. Difference: ${differenceEur}€`,
					);
				}
				if (compare(balanceSheet.assets.totalAssets, zeroMonetary()) === 0) {
					errors.push("Balance sheet must have non-zero total assets");
				}
				return errors;
			});

		return BalanceSheetService.of({
			generateBalanceSheet,
			validateBalanceSheet,
		});
	}),
);
