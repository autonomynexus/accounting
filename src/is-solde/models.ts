import type { MonetaryAmount } from "../models.js";

// ============================================================================
// 2572-SD — Relevé de Solde d'Impôt sur les Sociétés
// ============================================================================

export type Acompte = {
  readonly date: Date;
  readonly montant: MonetaryAmount;
};

export type Form2572 = {
  readonly _tag: "Form2572";
  readonly siren: string;
  readonly denomination: string;
  readonly exerciceStart: Date;
  readonly exerciceEnd: Date;
  readonly isFirstExercise: boolean;

  /** Résultat fiscal */
  readonly resultatFiscal: MonetaryAmount;
  /** IS brut calculé (15% / 25%) */
  readonly isBrut: MonetaryAmount;
  /** Acomptes versés */
  readonly acomptes: readonly Acompte[];
  /** Total des acomptes */
  readonly totalAcomptes: MonetaryAmount;
  /** Solde à payer (IS brut - acomptes). Negative = créance */
  readonly solde: MonetaryAmount;
  /** IS à payer (solde if positive, 0 otherwise) */
  readonly isAPayer: MonetaryAmount;
  /** Excédent à imputer (solde if negative, 0 otherwise) */
  readonly excedent: MonetaryAmount;
};

// ============================================================================
// Snapshot
// ============================================================================

export type Form2572Snapshot = {
  readonly _tag: "Form2572Snapshot";
  readonly siren: string;
  readonly denomination: string;
  readonly exerciceStart: string;
  readonly exerciceEnd: string;
  readonly generatedAt: string;
  readonly resultatFiscal: number;
  readonly isBrut: number;
  readonly totalAcomptes: number;
  readonly solde: number;
  readonly isAPayer: number;
  readonly excedent: number;
};
