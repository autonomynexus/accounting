import type { MonetaryAmount } from "../models.js";
export type IncomeStatementFormat = "BASIC" | "SIMPLIFIED" | "ABBREVIATED";
export type IncomeStatementLine = {
    readonly accountCode: string;
    readonly accountName: string;
    readonly currentYearAmount: MonetaryAmount;
    readonly previousYearAmount?: MonetaryAmount;
};
export type IncomeStatementSection = {
    readonly title: string;
    readonly lines: readonly IncomeStatementLine[];
    readonly subtotal: MonetaryAmount;
};
export type IncomeStatement = {
    readonly fiscalYear: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
    readonly generatedAt: Date;
    readonly format: IncomeStatementFormat;
    readonly operatingRevenue: IncomeStatementSection;
    readonly operatingExpenses: IncomeStatementSection;
    readonly operatingResult: MonetaryAmount;
    readonly financialRevenue: IncomeStatementSection;
    readonly financialExpenses: IncomeStatementSection;
    readonly financialResult: MonetaryAmount;
    readonly exceptionalRevenue: IncomeStatementSection;
    readonly exceptionalExpenses: IncomeStatementSection;
    readonly exceptionalResult: MonetaryAmount;
    readonly incomeTax: IncomeStatementSection;
    readonly netResult: MonetaryAmount;
    readonly isCalculationCorrect: boolean;
};
//# sourceMappingURL=income-statement-models.d.ts.map