/**
 * IS (Impôt sur les Sociétés) Computation
 * 2572-SD (Relevé de solde), 2065 (Déclaration de résultats)
 */

import type { MonetaryAmount } from "../models.js";

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
] as const;

export type AcompteIS = {
  readonly numero: 1 | 2 | 3 | 4;
  readonly dateEcheance: Date;
  readonly montant: MonetaryAmount;
  readonly paye: boolean;
  readonly datePaiement: Date | null;
};

// ============================================================================
// 2572-SD — Relevé de solde IS
// ============================================================================

export type Form2572 = {
  readonly _tag: "Form2572";
  readonly exercice: {
    readonly dateDebut: Date;
    readonly dateFin: Date;
  };
  readonly siren: string;
  readonly denomination: string;

  /** Résultat fiscal */
  readonly resultatFiscal: MonetaryAmount;
  /** Chiffre d'affaires HT */
  readonly chiffreAffairesHT: MonetaryAmount;
  /** Éligible au taux réduit */
  readonly eligibleTauxReduit: boolean;

  /** IS au taux réduit (15% sur première tranche) */
  readonly isAuTauxReduit: MonetaryAmount;
  /** IS au taux normal (25% sur le reste) */
  readonly isAuTauxNormal: MonetaryAmount;
  /** IS brut total */
  readonly isBrut: MonetaryAmount;

  /** Contribution sociale sur les bénéfices (3.3%) */
  readonly contributionSociale: MonetaryAmount;
  /** IS + contribution sociale */
  readonly totalDu: MonetaryAmount;

  /** Acomptes versés */
  readonly acomptesVerses: MonetaryAmount;
  /** Crédits d'impôt */
  readonly creditsImpot: MonetaryAmount;
  /** Solde à payer (ou crédit à reporter) */
  readonly solde: MonetaryAmount;
  /** Excédent de versement (si solde négatif) */
  readonly excedentVersement: MonetaryAmount;
};

// ============================================================================
// Déficits reportables
// ============================================================================

export type DeficitReportable = {
  readonly exerciceOrigine: string; // ISO date of exercise end
  readonly montant: MonetaryAmount;
  readonly montantUtilise: MonetaryAmount;
  readonly montantRestant: MonetaryAmount;
};

export type SuiviDeficits = {
  readonly deficits: readonly DeficitReportable[];
  readonly totalRestant: MonetaryAmount;
};
