import type { Monetary } from "@autonomynexus/monetary";

export type BalanceSheetLine = {
  readonly accountCode: string;
  readonly accountName: string;
  readonly currentYearAmount: Monetary<number>;
  readonly previousYearAmount?: Monetary<number>;
  readonly note?: string;
};

export type BalanceSheetSection = {
  readonly title: string;
  readonly lines: readonly BalanceSheetLine[];
  readonly subtotal: Monetary<number>;
};

export type BalanceSheetFormat = "BASIC" | "SIMPLIFIED" | "ABBREVIATED";

export type BalanceSheet = {
  readonly fiscalYear: {
    readonly startDate: Date;
    readonly endDate: Date;
  };
  readonly generatedAt: Date;
  readonly format: BalanceSheetFormat;

  // Assets (Actif)
  readonly assets: {
    readonly fixedAssets: BalanceSheetSection; // Actif immobilisé
    readonly currentAssets: BalanceSheetSection; // Actif circulant
    readonly totalAssets: Monetary<number>;
  };

  // Liabilities (Passif)
  readonly liabilities: {
    readonly equity: BalanceSheetSection; // Capitaux propres
    readonly provisions: BalanceSheetSection; // Provisions
    readonly debts: BalanceSheetSection; // Dettes
    readonly totalLiabilities: Monetary<number>;
  };

  // Validation
  readonly isBalanced: boolean;
  readonly balanceDifference: Monetary<number>;
};
