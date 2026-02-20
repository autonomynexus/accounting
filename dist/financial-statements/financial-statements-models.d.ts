import type { BalanceSheet } from "./balance-sheet-models.js";
import type { IncomeStatement } from "./income-statement-models.js";
export type FinancialStatements = {
    readonly fiscalYear: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
    readonly generatedAt: Date;
    readonly balanceSheet: BalanceSheet;
    readonly incomeStatement: IncomeStatement;
    readonly isComplete: boolean;
    readonly validationErrors: readonly string[];
    readonly agmDeadline: Date;
    readonly filingDeadline: Date;
};
export type FinancialStatementsHTMLFormat = {
    readonly html: string;
};
//# sourceMappingURL=financial-statements-models.d.ts.map