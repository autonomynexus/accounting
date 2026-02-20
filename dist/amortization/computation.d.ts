/**
 * Amortization Computation — Pure functions
 * Linear and declining balance per PCG
 */
import type { MonetaryAmount } from "../models.js";
import type { AmortizationSchedule, AmortizationMethod, Immobilisation, CessionImmobilisation } from "./models.js";
/**
 * Compute prorata temporis for amortization.
 *
 * **Linear method**: Uses the **days/360 convention** (année commerciale),
 * which is the most common convention in French fiscal practice and accepted
 * by the administration fiscale. Each month is counted as 30 days.
 *
 * **Declining balance method**: Uses months/12 convention per CGI,
 * counting the month of acquisition as a full month.
 */
export declare function computeProrata(dateDebut: Date, dateFin: Date, methode: AmortizationMethod): number;
export declare function computeAmortissementLineaire(immo: Immobilisation, exerciceDates: readonly {
    readonly dateDebut: Date;
    readonly dateFin: Date;
}[]): AmortizationSchedule;
export declare function computeAmortissementDegressif(immo: Immobilisation, exerciceDates: readonly {
    readonly dateDebut: Date;
    readonly dateFin: Date;
}[]): AmortizationSchedule;
export declare function computeCession(immo: Immobilisation, schedule: AmortizationSchedule, dateCession: Date, prixCession: MonetaryAmount): CessionImmobilisation;
//# sourceMappingURL=computation.d.ts.map