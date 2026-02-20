/**
 * Company Structure — Capital, ownership, and PME eligibility
 *
 * Models shareholder structure and checks PME eligibility conditions
 * per CGI Art. 219-I-b (IS taux réduit) and EU PME definition
 * (Annexe I, Regulation 651/2014).
 */
import { greaterThan, monetary, EUR } from "monetary";
// ============================================================================
// PME Eligibility Check
// ============================================================================
const TEN_MILLION = monetary({ amount: 10_000_000 * 100, currency: EUR });
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
export function isPMEEligible(structure) {
    const reasons = [];
    let eligible = true;
    // Condition 1: CA HT < €10M (CGI Art. 219-I-b)
    if (greaterThan(structure.chiffreAffairesHT, TEN_MILLION) || structure.chiffreAffairesHT.amount === TEN_MILLION.amount) {
        reasons.push("❌ CA HT ≥ €10M — condition non remplie (CGI Art. 219-I-b)");
        eligible = false;
    }
    else {
        reasons.push("✅ CA HT < €10M");
    }
    // Condition 2: Capital entièrement libéré (CGI Art. 219-I-b)
    if (greaterThan(structure.capitalSocial, structure.capitalLibere)) {
        reasons.push("❌ Capital non entièrement libéré — condition non remplie (CGI Art. 219-I-b)");
        eligible = false;
    }
    else {
        reasons.push("✅ Capital entièrement libéré");
    }
    // Condition 3: Capital détenu ≥75% par des personnes physiques (CGI Art. 219-I-b)
    const naturalPersonPercentage = structure.shareholders
        .filter((s) => s.type === "natural_person")
        .reduce((sum, s) => sum + s.sharePercentage, 0);
    if (naturalPersonPercentage < 75) {
        reasons.push(`❌ Capital détenu à ${naturalPersonPercentage.toFixed(1)}% par des personnes physiques (< 75%) — condition non remplie (CGI Art. 219-I-b)`);
        eligible = false;
    }
    else {
        reasons.push(`✅ Capital détenu à ${naturalPersonPercentage.toFixed(1)}% par des personnes physiques (≥ 75%)`);
    }
    // Condition 4: Effectif < 50 (EU PME, Annexe I Reg. 651/2014)
    if (structure.effectifMoyen >= 50) {
        reasons.push(`⚠️ Effectif moyen = ${structure.effectifMoyen} (≥ 50) — critère EU PME non rempli`);
        // Note: this is EU PME, not strictly required for IS taux réduit per CGI 219-I-b
    }
    else {
        reasons.push(`✅ Effectif moyen = ${structure.effectifMoyen} (< 50)`);
    }
    // Condition 5: Total bilan < €10M (EU PME, Annexe I Reg. 651/2014)
    if (greaterThan(structure.totalBilan, TEN_MILLION) || structure.totalBilan.amount === TEN_MILLION.amount) {
        reasons.push("⚠️ Total bilan ≥ €10M — critère EU PME non rempli");
    }
    else {
        reasons.push("✅ Total bilan < €10M");
    }
    return { eligible, reasons };
}
/**
 * Derive the legacy boolean flags from CompanyStructure for backward compatibility.
 */
export function deriveISEligibilityFlags(structure) {
    const capitalEntierementLibere = !greaterThan(structure.capitalSocial, structure.capitalLibere);
    const naturalPersonPercentage = structure.shareholders
        .filter((s) => s.type === "natural_person")
        .reduce((sum, s) => sum + s.sharePercentage, 0);
    return {
        capitalEntierementLibere,
        detenuParPersonnesPhysiques75: naturalPersonPercentage >= 75,
    };
}
//# sourceMappingURL=company-structure.js.map