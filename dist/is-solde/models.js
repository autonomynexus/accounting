/**
 * IS (Impôt sur les Sociétés) Computation
 * 2572-SD (Relevé de solde), 2065 (Déclaration de résultats)
 */
// ============================================================================
// IS Rate Schedule (2025)
// ============================================================================
/** IS rate thresholds */
export const IS_TAUX_REDUIT_PLAFOND = 42500; // € — seuil bénéfice taux réduit
export const IS_CA_PLAFOND_TAUX_REDUIT = 10_000_000; // € — CA max pour taux réduit
export const IS_TAUX_REDUIT = 0.15; // 15%
export const IS_TAUX_NORMAL = 0.25; // 25%
export const IS_CONTRIBUTION_SOCIALE_SEUIL = 763_000; // € — seuil IS pour contribution sociale
export const IS_CONTRIBUTION_SOCIALE_TAUX = 0.033; // 3.3%
export const IS_CONTRIBUTION_SOCIALE_ABATTEMENT = 763_000; // € — abattement
// ============================================================================
// Acomptes IS
// ============================================================================
/** Dates limites des acomptes (jour/mois) */
export const ACOMPTES_DATES = [
    { mois: 3, jour: 15 }, // 15 mars
    { mois: 6, jour: 15 }, // 15 juin
    { mois: 9, jour: 15 }, // 15 septembre
    { mois: 12, jour: 15 }, // 15 décembre
];
//# sourceMappingURL=models.js.map