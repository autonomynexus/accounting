import type { MonetaryAmount } from "../models.js";

// Income Statement format according to French accounting standards
export type IncomeStatementFormat = "BASIC" | "SIMPLIFIED" | "ABBREVIATED";

// Income Statement line item
export type IncomeStatementLine = {
  readonly accountCode: string;
  readonly accountName: string;
  readonly currentYearAmount: MonetaryAmount;
  readonly previousYearAmount?: MonetaryAmount;
};

// Income Statement section
export type IncomeStatementSection = {
  readonly title: string;
  readonly lines: readonly IncomeStatementLine[];
  readonly subtotal: MonetaryAmount;
};

// Complete Income Statement (Compte de Résultat)
export type IncomeStatement = {
  readonly fiscalYear: {
    readonly startDate: Date;
    readonly endDate: Date;
  };
  readonly generatedAt: Date;
  readonly format: IncomeStatementFormat;

  // Operating results
  readonly operatingRevenue: IncomeStatementSection;
  readonly operatingExpenses: IncomeStatementSection;
  readonly operatingResult: MonetaryAmount;

  // Financial results
  readonly financialRevenue: IncomeStatementSection;
  readonly financialExpenses: IncomeStatementSection;
  readonly financialResult: MonetaryAmount;

  // Exceptional results
  readonly exceptionalRevenue: IncomeStatementSection;
  readonly exceptionalExpenses: IncomeStatementSection;
  readonly exceptionalResult: MonetaryAmount;

  // Tax
  readonly incomeTax: IncomeStatementSection;

  // Net result
  readonly netResult: MonetaryAmount;

  // Validation
  readonly isCalculationCorrect: boolean;
};
