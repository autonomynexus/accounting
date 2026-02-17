import { addQuarters, endOfQuarter } from "date-fns";

export type ActivityType = "BNC" | "BIC_SERVICES" | "BIC_GOODS";
export type RateType = "base" | "acre_year1" | "versement_liberatoire" | "cfp";

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

export function getAcreRateType(hasAcre: boolean): RateType {
  return hasAcre ? "acre_year1" : "base";
}
