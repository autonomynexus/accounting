/**
 * Soldes Intermédiaires de Gestion (SIG)
 * Computed from trial balance per PCG format
 */
import type { MonetaryAmount } from "../models.js";
import type { TrialBalance } from "../engine/models.js";
export type SIG = {
    readonly margeCommerciale: MonetaryAmount;
    readonly productionExercice: MonetaryAmount;
    readonly valeurAjoutee: MonetaryAmount;
    readonly excedentBrutExploitation: MonetaryAmount;
    readonly resultatExploitation: MonetaryAmount;
    readonly resultatCourantAvantImpots: MonetaryAmount;
    readonly resultatExceptionnel: MonetaryAmount;
    readonly resultatNet: MonetaryAmount;
};
/**
 * Compute SIG from trial balance.
 *
 * All amounts are from the credit side for revenue (class 7)
 * and debit side for expenses (class 6).
 */
export declare function computeSIG(tb: TrialBalance): SIG;
//# sourceMappingURL=sig.d.ts.map