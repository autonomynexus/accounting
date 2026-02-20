/**
 * Liasse Fiscale Computation — IS Regime
 * Computes forms 2050-2059 from trial balance
 */
import type { MonetaryAmount } from "../models.js";
import type { TrialBalance } from "../engine/models.js";
import type { Form2050, Form2051, Form2052, Form2053, Form2058A } from "./models.js";
import type { Form2050CerfaData, Form2051CerfaData, Form2052CerfaData, Form2053CerfaData } from "./cerfa-lines.js";
export declare function computeForm2050(tb: TrialBalance): Form2050;
export declare function computeForm2051(tb: TrialBalance): Form2051;
export declare function computeForm2052(tb: TrialBalance): Form2052;
export declare function computeForm2053(tb: TrialBalance): Form2053;
export type ResultatFiscalAdjustments = {
    readonly remunerationExploitant: MonetaryAmount;
    readonly chargesNonDeductibles: MonetaryAmount;
    readonly amortissementsExcedentaires: MonetaryAmount;
    readonly provisionsNonDeductibles: MonetaryAmount;
    readonly autresReintegrations: MonetaryAmount;
    readonly produitsNonImposables: MonetaryAmount;
    readonly deficitsAnterieurs: MonetaryAmount;
    readonly autresDeductions: MonetaryAmount;
};
export declare function computeForm2058A(tb: TrialBalance, adjustments: ResultatFiscalAdjustments): Form2058A;
/**
 * Convert Form2050 (descriptive keys) to CERFA line-code–keyed data.
 *
 * Maps the simplified model fields to official CERFA 2050 (10937) line codes.
 * Lines not computed individually are omitted (Partial record).
 */
export declare function form2050ToCerfa(form: Form2050): Form2050CerfaData;
/**
 * Convert Form2051 (descriptive keys) to CERFA line-code–keyed data.
 *
 * Maps to official CERFA 2051 (10938) line codes.
 */
export declare function form2051ToCerfa(form: Form2051): Form2051CerfaData;
/**
 * Convert Form2052 (descriptive keys) to CERFA line-code–keyed data.
 *
 * Maps to official CERFA 2052 (10167) line codes.
 */
export declare function form2052ToCerfa(form: Form2052): Form2052CerfaData;
/**
 * Convert Form2053 (descriptive keys) to CERFA line-code–keyed data.
 *
 * Maps to official CERFA 2053 (10168) line codes.
 */
export declare function form2053ToCerfa(form: Form2053): Form2053CerfaData;
//# sourceMappingURL=computation.d.ts.map