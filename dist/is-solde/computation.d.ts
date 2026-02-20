/**
 * IS Computation — Pure calculation functions
 */
import type { MonetaryAmount } from "../models.js";
import type { Form2572 } from "./models.js";
export type ComputeISInput = {
    readonly resultatFiscal: MonetaryAmount;
    readonly chiffreAffairesHT: MonetaryAmount;
    readonly acomptesVerses: MonetaryAmount;
    readonly creditsImpot: MonetaryAmount;
    readonly siren: string;
    readonly denomination: string;
    readonly exerciceDateDebut: Date;
    readonly exerciceDateFin: Date;
    readonly dureeExerciceMois: number;
    /**
     * Capital entièrement libéré — required for PME reduced rate eligibility.
     * Per CGI Art. 219-I-b, the 15% reduced rate requires capital entièrement libéré.
     * Defaults to false if not provided.
     */
    readonly capitalEntierementLibere?: boolean;
    /**
     * Capital détenu à 75% ou plus par des personnes physiques.
     * Per CGI Art. 219-I-b, required for PME reduced rate eligibility.
     * Defaults to false if not provided.
     */
    readonly detenuParPersonnesPhysiques75?: boolean;
};
/**
 * Compute IS (Impôt sur les Sociétés).
 *
 * Taux réduit: 15% sur les premiers 42 500€ si CA < 10M€
 * Taux normal: 25% sur le reste
 * Contribution sociale: 3.3% si IS > 763K€ (abattement 763K€)
 * Prorata temporis pour exercices != 12 mois
 */
export declare function computeIS(input: ComputeISInput): Form2572;
/**
 * Compute IS acompte due dates for any fiscal year.
 *
 * Per CGI Art. 1668 and BOI-IS-DECLA-20-10-10 §40, each IS acompte is due
 * on the 15th of the last month of each quarter counted from the fiscal year start.
 *
 * Offsets from the first day of the fiscal year:
 *   - Acompte 1: 3rd month, day 15 (month + 2)
 *   - Acompte 2: 6th month, day 15 (month + 5)
 *   - Acompte 3: 9th month, day 15 (month + 8)
 *   - Acompte 4: 12th month, day 15 (month + 11)
 *
 * For a standard Jan–Dec fiscal year, this yields Mar 15, Jun 15, Sep 15, Dec 15.
 * For an Apr–Mar fiscal year: Jun 15, Sep 15, Dec 15, Mar 15.
 *
 * For a first/short exercise, only acomptes whose due date falls on or before
 * the exercise end date are included (the 4th acompte for a 12-month year always
 * falls on or before the last day of the 12th month).
 *
 * @param exerciceDateDebut - Start date of the fiscal year
 * @param exerciceDateFin - End date of the fiscal year
 * @returns Array of acompte due dates (may be fewer than 4 for short exercises)
 */
export declare function computeAcompteDates(exerciceDateDebut: Date, exerciceDateFin: Date): Date[];
/**
 * Compute IS quarterly advance payments (acomptes).
 *
 * Uses computeAcompteDates to determine due dates based on fiscal year dates.
 * For non-calendar fiscal years, dates are correctly offset from the fiscal year start.
 *
 * @param isPrecedent - IS amount from the previous fiscal year (basis for 25% quarterly payments)
 * @param exerciceDateDebut - Start date of the current fiscal year
 * @param exerciceDateFin - End date of the current fiscal year
 */
export declare function computeAcomptes(isPrecedent: MonetaryAmount, exerciceDateDebut: Date, exerciceDateFin: Date): readonly {
    readonly numero: 1 | 2 | 3 | 4;
    readonly dateEcheance: Date;
    readonly montant: MonetaryAmount;
}[];
export declare function applyDeficitReportEnAvant(resultatFiscal: MonetaryAmount, deficitsAnterieurs: MonetaryAmount): {
    readonly resultatApresImputation: MonetaryAmount;
    readonly deficitUtilise: MonetaryAmount;
    readonly deficitRestant: MonetaryAmount;
};
//# sourceMappingURL=computation.d.ts.map