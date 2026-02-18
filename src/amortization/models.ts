/**
 * Amortization Engine — Models
 * Linear and declining balance amortization per PCG
 */

import type { MonetaryAmount } from "../models.js";

// ============================================================================
// Amortization Methods
// ============================================================================

export type AmortizationMethod = "LINEAIRE" | "DEGRESSIF";

/**
 * PCG declining balance coefficients (amortissement dégressif)
 * Based on useful life duration.
 */
export const DEGRESSIF_COEFFICIENTS: readonly { readonly minYears: number; readonly maxYears: number; readonly coefficient: number }[] = [
  { minYears: 3, maxYears: 4, coefficient: 1.25 },
  { minYears: 5, maxYears: 6, coefficient: 1.75 },
  { minYears: 7, maxYears: Infinity, coefficient: 2.25 },
];

export function getDegressifCoefficient(dureeAnnees: number): number {
  for (const c of DEGRESSIF_COEFFICIENTS) {
    if (dureeAnnees >= c.minYears && dureeAnnees <= c.maxYears) {
      return c.coefficient;
    }
  }
  return 1.0; // Fallback (should not happen for eligible assets)
}

// ============================================================================
// Immobilisation (Fixed Asset)
// ============================================================================

export type ImmobilisationStatus = "EN_SERVICE" | "CEDEE" | "MISE_AU_REBUT" | "TOTALEMENT_AMORTIE";

export type Immobilisation = {
  readonly id: string;
  readonly compteNum: string; // PCG account (20x, 21x)
  readonly compteAmortNum: string; // Amortization account (28x)
  readonly libelle: string;
  readonly dateAcquisition: Date;
  readonly dateMiseEnService: Date;
  readonly dateCession: Date | null;
  readonly valeurAcquisition: MonetaryAmount; // Base amortissable
  readonly valeurResiduelle: MonetaryAmount; // Valeur résiduelle (usually 0)
  readonly dureeAmortissement: number; // In years
  readonly methode: AmortizationMethod;
  readonly status: ImmobilisationStatus;
  readonly exerciceId: string;
};

// ============================================================================
// Amortization Schedule
// ============================================================================

export type AmortizationLine = {
  readonly exercice: string; // e.g. "2024"
  readonly dateDebut: Date;
  readonly dateFin: Date;
  readonly baseAmortissable: MonetaryAmount;
  readonly taux: number; // Annual rate
  readonly prorata: number; // Days/360 or months/12 for partial year
  readonly dotation: MonetaryAmount; // Amortization for this period
  readonly amortissementsCumules: MonetaryAmount;
  readonly valeurNetteComptable: MonetaryAmount;
};

export type AmortizationSchedule = {
  readonly immobilisationId: string;
  readonly methode: AmortizationMethod;
  readonly lignes: readonly AmortizationLine[];
  readonly totalDotations: MonetaryAmount;
};

// ============================================================================
// Cession (Disposal)
// ============================================================================

export type CessionImmobilisation = {
  readonly immobilisationId: string;
  readonly dateCession: Date;
  readonly prixCession: MonetaryAmount;
  readonly valeurNetteComptable: MonetaryAmount; // VNC at disposal date
  readonly plusOuMoinsValue: MonetaryAmount; // Prix - VNC
  readonly dotationComplementaire: MonetaryAmount; // Prorata for partial year
};
