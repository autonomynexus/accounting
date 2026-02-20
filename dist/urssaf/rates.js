import { addQuarters, endOfQuarter } from "date-fns";
const ACTIVITY_TYPES = ["BNC", "BIC_SERVICES", "BIC_GOODS"];
export function isActivityType(value) {
    return typeof value === "string" && ACTIVITY_TYPES.includes(value);
}
/**
 * Check if ACRE benefit is active for a given declaration period.
 * ACRE ends at end of 3rd calendar quarter following the quarter of activity start.
 */
export function isAcreActive(hasAcre, activityStartDate, declarationDate) {
    if (!hasAcre)
        return false;
    const startQuarter = endOfQuarter(activityStartDate);
    const acreEndDate = endOfQuarter(addQuarters(startQuarter, 3));
    return declarationDate <= acreEndDate;
}
export function getAcreRateType(hasAcre) {
    return hasAcre ? "acre_year1" : "base";
}
//# sourceMappingURL=rates.js.map