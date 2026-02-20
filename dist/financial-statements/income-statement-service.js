import { Effect, Layer } from "effect";
import { add, EUR, monetary, subtract } from "monetary";
import { getPcgAccountsForInsert } from "../chart-of-accounts.js";
import { AccountingDataPort } from "../ports/accounting-data.port.js";
// ============================================================================
// Service Tag
// ============================================================================
export class IncomeStatementService extends Effect.Tag("@accounting/IncomeStatementService")() {
}
// ============================================================================
// Helpers
// ============================================================================
const zeroEUR = () => monetary({ amount: 0, currency: EUR });
function createIncomeStatementLine(balance, accountMap, previousYear, _sectionName) {
    const account = accountMap.get(balance.accountCode);
    if (!account)
        return null;
    const currentYearAmount = monetary({
        amount: Math.abs(balance.balance.amount),
        currency: EUR,
    });
    if (currentYearAmount.amount === 0)
        return null;
    const previousYearAmount = getPreviousYearAmount(balance.accountCode, previousYear);
    return {
        accountCode: balance.accountCode,
        accountName: account.name,
        currentYearAmount,
        previousYearAmount,
    };
}
function getPreviousYearAmount(accountCode, previousYear) {
    if (!previousYear)
        return undefined;
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
        if (line)
            return line.currentYearAmount;
    }
    return undefined;
}
function buildSection(title, balances, filter, accountMap, previousYear, sectionName) {
    const lines = balances
        .filter((b) => filter(b.accountCode))
        .map((b) => createIncomeStatementLine(b, accountMap, previousYear, sectionName))
        .filter((line) => line !== null);
    const subtotal = lines.reduce((sum, line) => add(sum, line.currentYearAmount), zeroEUR());
    return { title, lines, subtotal };
}
// ============================================================================
// Service Layer
// ============================================================================
export const IncomeStatementServiceLayer = Layer.effect(IncomeStatementService, Effect.gen(function* () {
    const dataPort = yield* AccountingDataPort;
    const allAccounts = getPcgAccountsForInsert();
    const accountMap = new Map(allAccounts.map((acc) => [acc.code, acc]));
    const generateIncomeStatement = (params) => Effect.gen(function* () {
        const { userId, fiscalYear, previousYearIncomeStatement } = params;
        const revenueBalances = yield* dataPort.getAccountBalancesByClass(userId, fiscalYear, 7);
        const expenseBalances = yield* dataPort.getAccountBalancesByClass(userId, fiscalYear, 6);
        const format = "SIMPLIFIED";
        const operatingRevenue = buildSection("Produits d'exploitation", revenueBalances, (code) => code >= "70" && code < "76", accountMap, previousYearIncomeStatement, "operatingRevenue");
        const operatingExpenses = buildSection("Charges d'exploitation", expenseBalances, (code) => code >= "60" && code < "66", accountMap, previousYearIncomeStatement, "operatingExpenses");
        const financialRevenue = buildSection("Produits financiers", revenueBalances, (code) => code.startsWith("76"), accountMap, previousYearIncomeStatement, "financialRevenue");
        const financialExpenses = buildSection("Charges financières", expenseBalances, (code) => code.startsWith("66"), accountMap, previousYearIncomeStatement, "financialExpenses");
        const exceptionalRevenue = buildSection("Produits exceptionnels", revenueBalances, (code) => code.startsWith("77") || code.startsWith("78"), accountMap, previousYearIncomeStatement, "exceptionalRevenue");
        const exceptionalExpenses = buildSection("Charges exceptionnelles", expenseBalances, (code) => code.startsWith("67") || code.startsWith("68"), accountMap, previousYearIncomeStatement, "exceptionalExpenses");
        const incomeTax = buildSection("Impôts sur les bénéfices", expenseBalances, (code) => code.startsWith("69"), accountMap, previousYearIncomeStatement, "incomeTax");
        const operatingResult = subtract(operatingRevenue.subtotal, operatingExpenses.subtotal);
        const financialResult = subtract(financialRevenue.subtotal, financialExpenses.subtotal);
        const exceptionalResult = subtract(exceptionalRevenue.subtotal, exceptionalExpenses.subtotal);
        const netResult = subtract(add(add(operatingResult, financialResult), exceptionalResult), incomeTax.subtotal);
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
}));
//# sourceMappingURL=income-statement-service.js.map