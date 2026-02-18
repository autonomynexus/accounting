/**
 * Amortization Computation — Pure functions
 * Linear and declining balance per PCG
 */

import { add, EUR, monetary, subtract, multiply, greaterThan, minimum } from "monetary";
import type { MonetaryAmount } from "../models.js";
import type {
  AmortizationLine,
  AmortizationSchedule,
  AmortizationMethod,
  Immobilisation,
  CessionImmobilisation,
} from "./models.js";
import { getDegressifCoefficient } from "./models.js";

const ZERO = monetary({ amount: 0, currency: EUR });

/** Helper: multiply and cast */
function mul(a: MonetaryAmount, rate: number): MonetaryAmount {
  return multiply(a, { amount: Math.round(rate * 10000), scale: 4 }) as unknown as MonetaryAmount;
}

/** Helper: minimum of two */
function min2(a: MonetaryAmount, b: MonetaryAmount): MonetaryAmount {
  return minimum([a, b]) as MonetaryAmount;
}

// ============================================================================
// Prorata temporis
// ============================================================================

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
export function computeProrata(
  dateDebut: Date,
  dateFin: Date,
  methode: AmortizationMethod,
): number {
  if (methode === "DEGRESSIF") {
    const months =
      (dateFin.getFullYear() - dateDebut.getFullYear()) * 12 +
      (dateFin.getMonth() - dateDebut.getMonth()) +
      1;
    return Math.min(months / 12, 1);
  }
  const days = Math.round((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(days / 360, 1);
}

// ============================================================================
// Linear Amortization
// ============================================================================

export function computeAmortissementLineaire(
  immo: Immobilisation,
  exerciceDates: readonly { readonly dateDebut: Date; readonly dateFin: Date }[],
): AmortizationSchedule {
  const baseAmortissable = subtract(immo.valeurAcquisition, immo.valeurResiduelle);
  const tauxAnnuel = 1 / immo.dureeAmortissement;
  const dotationAnnuelle = mul(baseAmortissable, tauxAnnuel);

  const lignes: AmortizationLine[] = [];
  let cumul = ZERO;
  let vnc = immo.valeurAcquisition;

  for (const exercice of exerciceDates) {
    if (exercice.dateFin < immo.dateMiseEnService) continue;
    if (!greaterThan(vnc, immo.valeurResiduelle)) break;

    const dateDebutAmort =
      exercice.dateDebut < immo.dateMiseEnService ? immo.dateMiseEnService : exercice.dateDebut;
    const prorata = computeProrata(dateDebutAmort, exercice.dateFin, "LINEAIRE");

    let dotation = mul(dotationAnnuelle, prorata);
    const restant = subtract(vnc, immo.valeurResiduelle);
    dotation = min2(dotation, restant);

    cumul = add(cumul, dotation);
    vnc = subtract(immo.valeurAcquisition, cumul);

    lignes.push({
      exercice: exercice.dateFin.getFullYear().toString(),
      dateDebut: dateDebutAmort,
      dateFin: exercice.dateFin,
      baseAmortissable,
      taux: tauxAnnuel,
      prorata,
      dotation,
      amortissementsCumules: cumul,
      valeurNetteComptable: vnc,
    });
  }

  return { immobilisationId: immo.id, methode: "LINEAIRE", lignes, totalDotations: cumul };
}

// ============================================================================
// Declining Balance Amortization
// ============================================================================

export function computeAmortissementDegressif(
  immo: Immobilisation,
  exerciceDates: readonly { readonly dateDebut: Date; readonly dateFin: Date }[],
): AmortizationSchedule {
  const coefficient = getDegressifCoefficient(immo.dureeAmortissement);
  const tauxLineaire = 1 / immo.dureeAmortissement;
  const tauxDegressif = tauxLineaire * coefficient;

  const lignes: AmortizationLine[] = [];
  let cumul = ZERO;
  let vnc = immo.valeurAcquisition;
  // Track remaining duration explicitly to avoid floating-point drift
  // from repeated fractional subtraction. We accumulate total prorata used
  // and compute remaining as: dureeAmortissement - totalProrataUsed
  let totalProrataUsed = 0;

  for (const exercice of exerciceDates) {
    if (exercice.dateFin < immo.dateMiseEnService) continue;
    const anneesRestantes = Math.round((immo.dureeAmortissement - totalProrataUsed) * 1000) / 1000;
    if (!greaterThan(vnc, immo.valeurResiduelle) || anneesRestantes <= 0) break;

    const dateDebutAmort =
      exercice.dateDebut < immo.dateMiseEnService ? immo.dateMiseEnService : exercice.dateDebut;
    const prorata = computeProrata(dateDebutAmort, exercice.dateFin, "DEGRESSIF");

    const tauxLineaireRestant = anneesRestantes > 0 ? 1 / anneesRestantes : 1;
    const useTaux = Math.max(tauxDegressif, tauxLineaireRestant);

    let dotation = mul(vnc, useTaux * prorata);
    const restant = subtract(vnc, immo.valeurResiduelle);
    dotation = min2(dotation, restant);

    cumul = add(cumul, dotation);
    vnc = subtract(immo.valeurAcquisition, cumul);
    totalProrataUsed += prorata;

    lignes.push({
      exercice: exercice.dateFin.getFullYear().toString(),
      dateDebut: dateDebutAmort,
      dateFin: exercice.dateFin,
      baseAmortissable: vnc,
      taux: useTaux,
      prorata,
      dotation,
      amortissementsCumules: cumul,
      valeurNetteComptable: vnc,
    });
  }

  return { immobilisationId: immo.id, methode: "DEGRESSIF", lignes, totalDotations: cumul };
}

// ============================================================================
// Asset Disposal
// ============================================================================

export function computeCession(
  immo: Immobilisation,
  schedule: AmortizationSchedule,
  dateCession: Date,
  prixCession: MonetaryAmount,
): CessionImmobilisation {
  let vncAvantCession = immo.valeurAcquisition;

  for (const ligne of schedule.lignes) {
    if (ligne.dateFin <= dateCession) {
      vncAvantCession = ligne.valeurNetteComptable;
    }
  }

  const lastDate = schedule.lignes.length > 0
    ? schedule.lignes[schedule.lignes.length - 1]!.dateFin
    : immo.dateMiseEnService;

  let dotationComplementaire = ZERO;
  if (dateCession > lastDate) {
    const prorata = computeProrata(lastDate, dateCession, immo.methode);
    const tauxAnnuel = 1 / immo.dureeAmortissement;
    const base = subtract(immo.valeurAcquisition, immo.valeurResiduelle);
    dotationComplementaire = min2(mul(base, tauxAnnuel * prorata), vncAvantCession);
    vncAvantCession = subtract(vncAvantCession, dotationComplementaire);
  }

  return {
    immobilisationId: immo.id,
    dateCession,
    prixCession,
    valeurNetteComptable: vncAvantCession,
    plusOuMoinsValue: subtract(prixCession, vncAvantCession),
    dotationComplementaire,
  };
}
