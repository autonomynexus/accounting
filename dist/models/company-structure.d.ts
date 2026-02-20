/**
 * Company Structure — Capital, ownership, and PME eligibility
 *
 * Models shareholder structure and checks PME eligibility conditions
 * per CGI Art. 219-I-b (IS taux réduit) and EU PME definition
 * (Annexe I, Regulation 651/2014).
 */
import type { MonetaryAmount } from "../models.js";
export type Shareholder = {
    readonly name: string;
    readonly type: "natural_person" | "legal_entity";
    readonly sharePercentage: number;
    readonly votingRightsPercentage?: number;
};
export type CompanyStructure = {
    readonly capitalSocial: MonetaryAmount;
    readonly capitalLibere: MonetaryAmount;
    readonly shareholders: readonly Shareholder[];
    readonly effectifMoyen: number;
    readonly totalBilan: MonetaryAmount;
    readonly chiffreAffairesHT: MonetaryAmount;
};
export type PMEEligibilityResult = {
    readonly eligible: boolean;
    readonly reasons: readonly string[];
};
/**
 * Check PME eligibility for IS taux réduit (15%).
 *
 * CGI Art. 219-I-b conditions (all must be met for taux réduit):
 *   1. CA HT < €10M
 *   2. Capital entièrement libéré (capitalLibere >= capitalSocial)
 *   3. Capital détenu ≥75% par des personnes physiques
 *
 * EU PME definition (Annexe I, Reg. 651/2014) — informational:
 *   4. Effectif < 50
 *   5. Total bilan < €10M
 *
 * @returns PMEEligibilityResult with eligible flag and reasons for each condition
 */
export declare function isPMEEligible(structure: CompanyStructure): PMEEligibilityResult;
/**
 * Derive the legacy boolean flags from CompanyStructure for backward compatibility.
 */
export declare function deriveISEligibilityFlags(structure: CompanyStructure): {
    capitalEntierementLibere: boolean;
    detenuParPersonnesPhysiques75: boolean;
};
//# sourceMappingURL=company-structure.d.ts.map