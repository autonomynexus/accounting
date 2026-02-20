/**
 * Amortization Engine — Models
 * Linear and declining balance amortization per PCG
 */
/**
 * PCG declining balance coefficients (amortissement dégressif)
 * Based on useful life duration.
 */
export const DEGRESSIF_COEFFICIENTS = [
    { minYears: 3, maxYears: 4, coefficient: 1.25 },
    { minYears: 5, maxYears: 6, coefficient: 1.75 },
    { minYears: 7, maxYears: Infinity, coefficient: 2.25 },
];
export function getDegressifCoefficient(dureeAnnees) {
    for (const c of DEGRESSIF_COEFFICIENTS) {
        if (dureeAnnees >= c.minYears && dureeAnnees <= c.maxYears) {
            return c.coefficient;
        }
    }
    return 1.0; // Fallback (should not happen for eligible assets)
}
//# sourceMappingURL=models.js.map