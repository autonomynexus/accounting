import type { BalanceSheet } from "./balance-sheet-models.js";
import type { IncomeStatement } from "./income-statement-models.js";

export type FinancialStatements = {
  readonly fiscalYear: {
    readonly startDate: Date;
    readonly endDate: Date;
  };
  readonly generatedAt: Date;

  // Required documents
  readonly balanceSheet: BalanceSheet;
  readonly incomeStatement: IncomeStatement;

  // Validation
  readonly isComplete: boolean;
  readonly validationErrors: readonly string[];

  // Legal compliance deadlines
  readonly agmDeadline: Date; // AGM: 6 months after fiscal year end
  readonly filingDeadline: Date; // Filing: 1 month after AGM
};

export type FinancialStatementsHTMLFormat = {
  readonly html: string;
};
