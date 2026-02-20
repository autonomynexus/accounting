import { MICRO_THRESHOLDS, VAT_THRESHOLDS } from "../regime/regime-details.js";
export const WARNING_THRESHOLD_PERCENT = 80;
export function getMicroThreshold(activityType) {
    switch (activityType) {
        case "BIC_GOODS":
            return MICRO_THRESHOLDS.BIC_GOODS;
        case "BIC_SERVICES":
            return MICRO_THRESHOLDS.BIC_SERVICES;
        case "BNC":
            return MICRO_THRESHOLDS.BNC;
        default: {
            const _exhaustive = activityType;
            throw new Error(`Unknown activity type: ${_exhaustive}`);
        }
    }
}
export function getVatThreshold(activityType) {
    switch (activityType) {
        case "BIC_GOODS":
            return VAT_THRESHOLDS.GOODS;
        case "BIC_SERVICES":
        case "BNC":
            return VAT_THRESHOLDS.SERVICES;
        default: {
            const _exhaustive = activityType;
            throw new Error(`Unknown activity type: ${_exhaustive}`);
        }
    }
}
export function getProratedThreshold(threshold, activityStartDate, year) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    if (activityStartDate < yearStart)
        return threshold;
    if (activityStartDate > yearEnd)
        return { ...threshold, amount: 0 };
    const daysInYear = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    const daysOfActivity = (yearEnd.getTime() - activityStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
    return {
        ...threshold,
        amount: Math.round((threshold.amount * daysOfActivity) / daysInYear),
    };
}
//# sourceMappingURL=models.js.map