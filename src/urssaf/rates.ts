import { addQuarters, endOfQuarter } from "date-fns";

export type ActivityType = "BNC" | "BIC_SERVICES" | "BIC_GOODS";
export type RateType = "base" | "acre_year1" | "acre_post_july2026" | "versement_liberatoire" | "cfp";

const ACTIVITY_TYPES: readonly ActivityType[] = ["BNC", "BIC_SERVICES", "BIC_GOODS"];

export function isActivityType(value: unknown): value is ActivityType {
  return typeof value === "string" && ACTIVITY_TYPES.includes(value as ActivityType);
}

/**
 * Check if ACRE benefit is active for a given declaration period.
 * ACRE ends at end of 3rd calendar quarter following the quarter of activity start.
 */
export function isAcreActive(
  hasAcre: boolean,
  activityStartDate: Date,
  declarationDate: Date,
): boolean {
  if (!hasAcre) return false;
  const startQuarter = endOfQuarter(activityStartDate);
  const acreEndDate = endOfQuarter(addQuarters(startQuarter, 3));
  return declarationDate <= acreEndDate;
}

/**
 * ACRE reform cutoff date: July 1, 2026.
 * Activities created from this date get reduced ACRE exonération (25% instead of 50%).
 */
const ACRE_REFORM_DATE = new Date(2026, 6, 1); // July 1, 2026

/**
 * Determine the applicable rate type based on ACRE status and activity creation date.
 *
 * - Pre-July 2026 creators: 50% exonération (acre_year1, pay ~50% of base rate)
 * - Post-July 2026 creators: 25% exonération (acre_post_july2026, pay ~75% of base rate)
 *
 * Ref: Décret n° 2026-69 du 6 février 2026 + LFSS 2026
 */
export function getAcreRateType(hasAcre: boolean, activityStartDate?: Date): RateType {
  if (!hasAcre) return "base";
  if (activityStartDate && activityStartDate >= ACRE_REFORM_DATE) {
    return "acre_post_july2026";
  }
  return "acre_year1";
}
