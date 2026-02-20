export type ActivityType = "BNC" | "BIC_SERVICES" | "BIC_GOODS";
export type RateType = "base" | "acre_year1" | "versement_liberatoire" | "cfp";
export declare function isActivityType(value: unknown): value is ActivityType;
/**
 * Check if ACRE benefit is active for a given declaration period.
 * ACRE ends at end of 3rd calendar quarter following the quarter of activity start.
 */
export declare function isAcreActive(hasAcre: boolean, activityStartDate: Date, declarationDate: Date): boolean;
export declare function getAcreRateType(hasAcre: boolean): RateType;
//# sourceMappingURL=rates.d.ts.map