import type { Monetary } from "monetary";
import type { ActivityType } from "../urssaf/rates.js";
export declare const WARNING_THRESHOLD_PERCENT = 80;
export type ThresholdWarningType = "approaching_micro" | "exceeded_micro" | "approaching_vat" | "exceeded_vat" | "regime_transition_risk";
export type ThresholdWarning = {
    readonly type: ThresholdWarningType;
    readonly activityType: ActivityType;
    readonly threshold: Monetary<number>;
    readonly current: Monetary<number>;
    readonly percentageUsed: number;
    readonly message: string;
};
export type ThresholdStatus = {
    readonly year: number;
    readonly activityType: ActivityType;
    readonly ytdRevenue: Monetary<number>;
    readonly microThreshold: Monetary<number>;
    readonly vatThreshold: Monetary<number>;
    readonly microPercentage: number;
    readonly vatPercentage: number;
    readonly warnings: readonly ThresholdWarning[];
    readonly previousYearExceeded: boolean;
    readonly currentYearExceeded: boolean;
    readonly regimeAtRisk: boolean;
};
export declare function getMicroThreshold(activityType: ActivityType): Monetary<number>;
export declare function getVatThreshold(activityType: ActivityType): Monetary<number>;
export declare function getProratedThreshold(threshold: Monetary<number>, activityStartDate: Date, year: number): Monetary<number>;
//# sourceMappingURL=models.d.ts.map