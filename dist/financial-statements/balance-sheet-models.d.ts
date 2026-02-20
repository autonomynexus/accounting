import type { Monetary } from "monetary";
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
    readonly assets: {
        readonly fixedAssets: BalanceSheetSection;
        readonly currentAssets: BalanceSheetSection;
        readonly totalAssets: Monetary<number>;
    };
    readonly liabilities: {
        readonly equity: BalanceSheetSection;
        readonly provisions: BalanceSheetSection;
        readonly debts: BalanceSheetSection;
        readonly totalLiabilities: Monetary<number>;
    };
    readonly isBalanced: boolean;
    readonly balanceDifference: Monetary<number>;
};
//# sourceMappingURL=balance-sheet-models.d.ts.map