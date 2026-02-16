import type { Monetary } from "monetary";
import { MICRO_THRESHOLDS, VAT_THRESHOLDS } from "../regime/regime-details.js";
import type { ActivityType } from "../urssaf/rates.js";

export const WARNING_THRESHOLD_PERCENT = 80;

export type ThresholdWarningType =
  | "approaching_micro"
  | "exceeded_micro"
  | "approaching_vat"
  | "exceeded_vat"
  | "regime_transition_risk";

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

export function getMicroThreshold(activityType: ActivityType): Monetary<number> {
  switch (activityType) {
    case "BIC_GOODS":
      return MICRO_THRESHOLDS.BIC_GOODS;
    case "BIC_SERVICES":
      return MICRO_THRESHOLDS.BIC_SERVICES;
    case "BNC":
      return MICRO_THRESHOLDS.BNC;
    default: {
      const _exhaustive: never = activityType;
      throw new Error(`Unknown activity type: ${_exhaustive}`);
    }
  }
}

export function getVatThreshold(activityType: ActivityType): Monetary<number> {
  switch (activityType) {
    case "BIC_GOODS":
      return VAT_THRESHOLDS.GOODS;
    case "BIC_SERVICES":
    case "BNC":
      return VAT_THRESHOLDS.SERVICES;
    default: {
      const _exhaustive: never = activityType;
      throw new Error(`Unknown activity type: ${_exhaustive}`);
    }
  }
}

export function getProratedThreshold(
  threshold: Monetary<number>,
  activityStartDate: Date,
  year: number,
): Monetary<number> {
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  if (activityStartDate < yearStart) return threshold;
  if (activityStartDate > yearEnd) return { ...threshold, amount: 0 };

  const daysInYear = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
  const daysOfActivity = (yearEnd.getTime() - activityStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

  return {
    ...threshold,
    amount: Math.round((threshold.amount * daysOfActivity) / daysInYear),
  };
}
