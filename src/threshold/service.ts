import { endOfYear, startOfYear } from "date-fns";
import { Effect, Layer } from "effect";
import { EUR, type Monetary, monetary } from "@autonomynexus/monetary";
import type { UserId } from "../models";
import { AccountingDataPort, type AccountingDataError } from "../ports";
import type { ActivityType } from "../urssaf/rates";
import {
  getMicroThreshold,
  getProratedThreshold,
  getVatThreshold,
  type ThresholdStatus,
  type ThresholdWarning,
  WARNING_THRESHOLD_PERCENT,
} from "./models";

// ============================================================================
// Service Interface
// ============================================================================

export type ThresholdMonitoringServiceInterface = {
  readonly getThresholdStatus: (
    userId: UserId,
    activityType: ActivityType,
    year: number,
    activityStartDate: Date,
  ) => Effect.Effect<ThresholdStatus, AccountingDataError>;
};

// ============================================================================
// Service Tag
// ============================================================================

export class ThresholdMonitoringService extends Effect.Tag(
  "@accounting/ThresholdMonitoringService",
)<ThresholdMonitoringService, ThresholdMonitoringServiceInterface>() {}

// ============================================================================
// Service Implementation
// ============================================================================

export const ThresholdMonitoringServiceLayer = Layer.effect(
  ThresholdMonitoringService,
  Effect.gen(function* () {
    const dataPort = yield* AccountingDataPort;

    const zeroMonetary = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

    const getYearlyRevenue = (userId: UserId, year: number) =>
      Effect.gen(function* () {
        const period = {
          startDate: startOfYear(new Date(year, 0, 1)),
          endDate: endOfYear(new Date(year, 0, 1)),
        };

        const balances = yield* dataPort.getAccountBalancesByClass(userId, period, 7);

        let total = zeroMonetary();
        for (const b of balances) {
          const balance = monetary({
            amount: b.creditTotal.amount - b.debitTotal.amount,
            currency: EUR,
          });
          total = monetary({
            amount: total.amount + balance.amount,
            currency: EUR,
          });
        }

        return total;
      });

    const getThresholdStatus: ThresholdMonitoringServiceInterface["getThresholdStatus"] = (
      userId,
      activityType,
      year,
      activityStartDate,
    ) =>
      Effect.gen(function* () {
        const ytdRevenue = yield* getYearlyRevenue(userId, year);
        const previousYearRevenue = yield* getYearlyRevenue(userId, year - 1);

        const microThreshold = getProratedThreshold(
          getMicroThreshold(activityType),
          activityStartDate,
          year,
        );
        const vatThreshold = getProratedThreshold(
          getVatThreshold(activityType),
          activityStartDate,
          year,
        );
        const previousMicroThreshold = getProratedThreshold(
          getMicroThreshold(activityType),
          activityStartDate,
          year - 1,
        );

        const microPercentage =
          microThreshold.amount > 0
            ? Math.round((ytdRevenue.amount / microThreshold.amount) * 100)
            : 0;
        const vatPercentage =
          vatThreshold.amount > 0 ? Math.round((ytdRevenue.amount / vatThreshold.amount) * 100) : 0;

        const currentYearExceeded = ytdRevenue.amount > microThreshold.amount;
        const previousYearExceeded = previousYearRevenue.amount > previousMicroThreshold.amount;
        const regimeAtRisk = currentYearExceeded && previousYearExceeded;

        const warnings: ThresholdWarning[] = [];

        if (microPercentage >= 100) {
          warnings.push({
            type: "exceeded_micro",
            activityType,
            threshold: microThreshold,
            current: ytdRevenue,
            percentageUsed: microPercentage,
            message: "Revenue exceeds micro-entreprise threshold",
          });
        } else if (microPercentage >= WARNING_THRESHOLD_PERCENT) {
          warnings.push({
            type: "approaching_micro",
            activityType,
            threshold: microThreshold,
            current: ytdRevenue,
            percentageUsed: microPercentage,
            message: `Approaching micro-entreprise threshold (${microPercentage}%)`,
          });
        }

        if (vatPercentage >= 100) {
          warnings.push({
            type: "exceeded_vat",
            activityType,
            threshold: vatThreshold,
            current: ytdRevenue,
            percentageUsed: vatPercentage,
            message: "Revenue exceeds VAT franchise threshold",
          });
        } else if (vatPercentage >= WARNING_THRESHOLD_PERCENT) {
          warnings.push({
            type: "approaching_vat",
            activityType,
            threshold: vatThreshold,
            current: ytdRevenue,
            percentageUsed: vatPercentage,
            message: `Approaching VAT franchise threshold (${vatPercentage}%)`,
          });
        }

        if (regimeAtRisk) {
          warnings.push({
            type: "regime_transition_risk",
            activityType,
            threshold: microThreshold,
            current: ytdRevenue,
            percentageUsed: microPercentage,
            message: "Threshold exceeded 2 consecutive years - regime transition required",
          });
        }

        return {
          year,
          activityType,
          ytdRevenue,
          microThreshold,
          vatThreshold,
          microPercentage,
          vatPercentage,
          warnings,
          previousYearExceeded,
          currentYearExceeded,
          regimeAtRisk,
        };
      });

    return ThresholdMonitoringService.of({
      getThresholdStatus,
    });
  }),
);
