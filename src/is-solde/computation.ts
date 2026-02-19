/**
 * IS Computation — Pure calculation functions
 */

import { add, EUR, monetary, subtract, greaterThan, isZero, multiply, minimum } from "monetary";
import type { MonetaryAmount } from "../models.js";
import type { Form2572 } from "./models.js";
import {
  IS_TAUX_REDUIT,
  IS_TAUX_NORMAL,
  IS_TAUX_REDUIT_PLAFOND,
  IS_CA_PLAFOND_TAUX_REDUIT,
  IS_CONTRIBUTION_SOCIALE_SEUIL,
  IS_CONTRIBUTION_SOCIALE_TAUX,
  IS_CONTRIBUTION_SOCIALE_ABATTEMENT,
} from "./models.js";

const ZERO = monetary({ amount: 0, currency: EUR });

/** Helper: multiply and cast back to MonetaryAmount */
function mul(a: MonetaryAmount, rate: number): MonetaryAmount {
  return multiply(a, { amount: Math.round(rate * 10000), scale: 4 }) as unknown as MonetaryAmount;
}

/** Helper: minimum of two MonetaryAmount */
function min2(a: MonetaryAmount, b: MonetaryAmount): MonetaryAmount {
  return minimum([a, b]) as MonetaryAmount;
}

// ============================================================================
// IS Calculation
// ============================================================================

export type ComputeISInput = {
  readonly resultatFiscal: MonetaryAmount;
  readonly chiffreAffairesHT: MonetaryAmount;
  readonly acomptesVerses: MonetaryAmount;
  readonly creditsImpot: MonetaryAmount;
  readonly siren: string;
  readonly denomination: string;
  readonly exerciceDateDebut: Date;
  readonly exerciceDateFin: Date;
  readonly dureeExerciceMois: number;
  /**
   * Capital entièrement libéré — required for PME reduced rate eligibility.
   * Per CGI Art. 219-I-b, the 15% reduced rate requires capital entièrement libéré.
   * Defaults to false if not provided.
   */
  readonly capitalEntierementLibere?: boolean;
  /**
   * Capital détenu à 75% ou plus par des personnes physiques.
   * Per CGI Art. 219-I-b, required for PME reduced rate eligibility.
   * Defaults to false if not provided.
   */
  readonly detenuParPersonnesPhysiques75?: boolean;
};

/**
 * Compute IS (Impôt sur les Sociétés).
 *
 * Taux réduit: 15% sur les premiers 42 500€ si CA < 10M€
 * Taux normal: 25% sur le reste
 * Contribution sociale: 3.3% si IS > 763K€ (abattement 763K€)
 * Prorata temporis pour exercices != 12 mois
 */
export function computeIS(input: ComputeISInput): Form2572 {
  const { resultatFiscal, chiffreAffairesHT, acomptesVerses, creditsImpot, dureeExerciceMois } = input;

  if (!greaterThan(resultatFiscal, ZERO)) {
    return {
      _tag: "Form2572",
      exercice: { dateDebut: input.exerciceDateDebut, dateFin: input.exerciceDateFin },
      siren: input.siren,
      denomination: input.denomination,
      resultatFiscal,
      chiffreAffairesHT,
      eligibleTauxReduit: false,
      isAuTauxReduit: ZERO,
      isAuTauxNormal: ZERO,
      isBrut: ZERO,
      contributionSociale: ZERO,
      totalDu: ZERO,
      acomptesVerses,
      creditsImpot,
      solde: subtract(ZERO, add(acomptesVerses, creditsImpot)),
      excedentVersement: add(acomptesVerses, creditsImpot),
    };
  }

  const caLimit = monetary({ amount: IS_CA_PLAFOND_TAUX_REDUIT * 100, currency: EUR });
  /**
   * PME reduced rate eligibility per CGI Art. 219-I-b requires ALL three conditions:
   * 1. CA HT < €10M
   * 2. Capital entièrement libéré
   * 3. Capital détenu ≥75% par des personnes physiques
   */
  const eligibleTauxReduit =
    !greaterThan(chiffreAffairesHT, caLimit) &&
    (input.capitalEntierementLibere ?? false) &&
    (input.detenuParPersonnesPhysiques75 ?? false);

  const plafondReduit = monetary({
    amount: Math.round((IS_TAUX_REDUIT_PLAFOND * 100 * dureeExerciceMois) / 12),
    currency: EUR,
  });

  let isAuTauxReduit = ZERO;
  let isAuTauxNormal = ZERO;

  if (eligibleTauxReduit) {
    const baseReduit = min2(resultatFiscal, plafondReduit);
    isAuTauxReduit = mul(baseReduit, IS_TAUX_REDUIT);
    const baseNormal = subtract(resultatFiscal, baseReduit);
    if (greaterThan(baseNormal, ZERO)) {
      isAuTauxNormal = mul(baseNormal, IS_TAUX_NORMAL);
    }
  } else {
    isAuTauxNormal = mul(resultatFiscal, IS_TAUX_NORMAL);
  }

  const isBrut = add(isAuTauxReduit, isAuTauxNormal);

  let contributionSociale = ZERO;
  /**
   * Contribution sociale sur les bénéfices (CSB) per CGI Art. 235 ter ZC:
   * - Only applies if CA > €7,630,000
   * - Rate: 3.3% on IS exceeding €763,000 abatement
   */
  const seuilCAContribSociale = monetary({ amount: 7_630_000 * 100, currency: EUR });
  const seuilCS = monetary({ amount: IS_CONTRIBUTION_SOCIALE_SEUIL * 100, currency: EUR });
  if (greaterThan(chiffreAffairesHT, seuilCAContribSociale) && greaterThan(isBrut, seuilCS)) {
    const abattement = monetary({ amount: IS_CONTRIBUTION_SOCIALE_ABATTEMENT * 100, currency: EUR });
    const base = subtract(isBrut, abattement);
    if (greaterThan(base, ZERO)) {
      contributionSociale = mul(base, IS_CONTRIBUTION_SOCIALE_TAUX);
    }
  }

  const totalDu = add(isBrut, contributionSociale);
  const totalCredits = add(acomptesVerses, creditsImpot);
  const solde = subtract(totalDu, totalCredits);
  const excedentVersement = greaterThan(solde, ZERO) ? ZERO : subtract(ZERO, solde);

  return {
    _tag: "Form2572",
    exercice: { dateDebut: input.exerciceDateDebut, dateFin: input.exerciceDateFin },
    siren: input.siren,
    denomination: input.denomination,
    resultatFiscal,
    chiffreAffairesHT,
    eligibleTauxReduit,
    isAuTauxReduit,
    isAuTauxNormal,
    isBrut,
    contributionSociale,
    totalDu,
    acomptesVerses,
    creditsImpot,
    solde: greaterThan(solde, ZERO) ? solde : ZERO,
    excedentVersement,
  };
}

// ============================================================================
// Acompte Date Computation
// ============================================================================

/**
 * Compute IS acompte due dates for any fiscal year.
 *
 * Per CGI Art. 1668 and BOI-IS-DECLA-20-10-10 §40, each IS acompte is due
 * on the 15th of the last month of each quarter counted from the fiscal year start.
 *
 * Offsets from the first day of the fiscal year:
 *   - Acompte 1: 3rd month, day 15 (month + 2)
 *   - Acompte 2: 6th month, day 15 (month + 5)
 *   - Acompte 3: 9th month, day 15 (month + 8)
 *   - Acompte 4: 12th month, day 15 (month + 11)
 *
 * For a standard Jan–Dec fiscal year, this yields Mar 15, Jun 15, Sep 15, Dec 15.
 * For an Apr–Mar fiscal year: Jun 15, Sep 15, Dec 15, Mar 15.
 *
 * For a first/short exercise, only acomptes whose due date falls on or before
 * the exercise end date are included (the 4th acompte for a 12-month year always
 * falls on or before the last day of the 12th month).
 *
 * @param exerciceDateDebut - Start date of the fiscal year
 * @param exerciceDateFin - End date of the fiscal year
 * @returns Array of acompte due dates (may be fewer than 4 for short exercises)
 */
export function computeAcompteDates(exerciceDateDebut: Date, exerciceDateFin: Date): Date[] {
  const monthOffsets = [2, 5, 8, 11]; // 3rd, 6th, 9th, 12th month from start

  const dates: Date[] = [];
  for (const offset of monthOffsets) {
    const d = new Date(exerciceDateDebut.getFullYear(), exerciceDateDebut.getMonth() + offset, 15);
    if (d <= exerciceDateFin) {
      dates.push(d);
    }
  }

  return dates;
}

// ============================================================================
// Acomptes Calculation
// ============================================================================

/**
 * Compute IS quarterly advance payments (acomptes).
 *
 * Uses computeAcompteDates to determine due dates based on fiscal year dates.
 * For non-calendar fiscal years, dates are correctly offset from the fiscal year start.
 *
 * @param isPrecedent - IS amount from the previous fiscal year (basis for 25% quarterly payments)
 * @param exerciceDateDebut - Start date of the current fiscal year
 * @param exerciceDateFin - End date of the current fiscal year
 */
export function computeAcomptes(
  isPrecedent: MonetaryAmount,
  exerciceDateDebut: Date,
  exerciceDateFin: Date,
): readonly { readonly numero: 1 | 2 | 3 | 4; readonly dateEcheance: Date; readonly montant: MonetaryAmount }[] {
  const dates = computeAcompteDates(exerciceDateDebut, exerciceDateFin);

  if (isZero(isPrecedent) || !greaterThan(isPrecedent, ZERO)) {
    return dates.map((d, i) => ({
      numero: (i + 1) as 1 | 2 | 3 | 4,
      dateEcheance: d,
      montant: ZERO,
    }));
  }

  const quart = mul(isPrecedent, 0.25);

  return dates.map((d, i) => ({
    numero: (i + 1) as 1 | 2 | 3 | 4,
    dateEcheance: d,
    montant: quart,
  }));
}

// ============================================================================
// Deficit carry-forward
// ============================================================================

export function applyDeficitReportEnAvant(
  resultatFiscal: MonetaryAmount,
  deficitsAnterieurs: MonetaryAmount,
): { readonly resultatApresImputation: MonetaryAmount; readonly deficitUtilise: MonetaryAmount; readonly deficitRestant: MonetaryAmount } {
  if (!greaterThan(resultatFiscal, ZERO) || isZero(deficitsAnterieurs) || !greaterThan(deficitsAnterieurs, ZERO)) {
    return {
      resultatApresImputation: resultatFiscal,
      deficitUtilise: ZERO,
      deficitRestant: deficitsAnterieurs,
    };
  }

  const seuilMillion = monetary({ amount: 1_000_000 * 100, currency: EUR });
  let plafondImputation: MonetaryAmount;

  if (greaterThan(resultatFiscal, seuilMillion)) {
    const auDela = subtract(resultatFiscal, seuilMillion);
    const moitieAuDela = mul(auDela, 0.50);
    plafondImputation = add(seuilMillion, moitieAuDela);
  } else {
    plafondImputation = resultatFiscal;
  }

  const deficitUtilise = min2(min2(deficitsAnterieurs, plafondImputation), resultatFiscal);
  const resultatApresImputation = subtract(resultatFiscal, deficitUtilise);
  const deficitRestant = subtract(deficitsAnterieurs, deficitUtilise);

  return { resultatApresImputation, deficitUtilise, deficitRestant };
}
