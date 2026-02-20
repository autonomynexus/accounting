/**
 * 2035 BNC Computation — Pure functions
 * Cash-basis accounting for profession libérale
 */

import { add, EUR, monetary, subtract } from "@autonomynexus/monetary";
import type { MonetaryAmount } from "../models.js";
import type { Form2035, Form2035A, Form2035B, Immo2035Line } from "./models.js";

const ZERO = monetary({ amount: 0, currency: EUR });

// ============================================================================
// Input types
// ============================================================================

export type Compute2035AInput = {
  readonly recettesEncaissees: MonetaryAmount;
  readonly deboursPourCompteClients?: MonetaryAmount;
  readonly honorairesRetrocedes?: MonetaryAmount;
  readonly produitsFinanciers?: MonetaryAmount;
  readonly gainsExceptionnels?: MonetaryAmount;
  readonly achats?: MonetaryAmount;
  readonly fournitures?: MonetaryAmount;
  readonly loyersEtChargesLocatives?: MonetaryAmount;
  readonly travauxEntretien?: MonetaryAmount;
  readonly primesAssurances?: MonetaryAmount;
  readonly transportEtDeplacements?: MonetaryAmount;
  readonly chargesLocatives?: MonetaryAmount;
  readonly autresServiceExternes?: MonetaryAmount;
  readonly fraisReception?: MonetaryAmount;
  readonly fournituresDeBureau?: MonetaryAmount;
  readonly documentationEtFormation?: MonetaryAmount;
  readonly fraisPostaux?: MonetaryAmount;
  readonly cotisationsSociales?: MonetaryAmount;
  readonly taxesProfessionnelles?: MonetaryAmount;
  readonly chargesFinancieres?: MonetaryAmount;
  readonly pertesExceptionnelles?: MonetaryAmount;
};

// ============================================================================
// Computation
// ============================================================================

export function compute2035A(input: Compute2035AInput): Form2035A {
  const z = (v: MonetaryAmount | undefined) => v ?? ZERO;

  const totalRecettes = add(
    add(add(input.recettesEncaissees, z(input.deboursPourCompteClients)), z(input.honorairesRetrocedes)),
    add(z(input.produitsFinanciers), z(input.gainsExceptionnels)),
  );

  const achats = z(input.achats);
  const fournitures = z(input.fournitures);
  const loyers = z(input.loyersEtChargesLocatives);
  const travaux = z(input.travauxEntretien);
  const assurances = z(input.primesAssurances);
  const transport = z(input.transportEtDeplacements);
  const chargesLoc = z(input.chargesLocatives);
  const autresServices = z(input.autresServiceExternes);
  const reception = z(input.fraisReception);
  const bureau = z(input.fournituresDeBureau);
  const documentation = z(input.documentationEtFormation);
  const postaux = z(input.fraisPostaux);
  const cotisations = z(input.cotisationsSociales);
  const taxes = z(input.taxesProfessionnelles);
  const chargesFin = z(input.chargesFinancieres);
  const pertes = z(input.pertesExceptionnelles);

  const totalDepenses = [
    achats, fournitures, loyers, travaux, assurances, transport,
    chargesLoc, autresServices, reception, bureau, documentation,
    postaux, cotisations, taxes, chargesFin, pertes,
  ].reduce((acc, v) => add(acc, v), ZERO);

  return {
    _tag: "Form2035A",
    recettesEncaissees: input.recettesEncaissees,
    deboursPourCompteClients: z(input.deboursPourCompteClients),
    honorairesRetrocedes: z(input.honorairesRetrocedes),
    produitsFinanciers: z(input.produitsFinanciers),
    gainsExceptionnels: z(input.gainsExceptionnels),
    totalRecettes,
    achats,
    fournitures: fournitures,
    loyersEtChargesLocatives: loyers,
    travauxEntretien: travaux,
    primesAssurances: assurances,
    transportEtDeplacements: transport,
    chargesLocatives: chargesLoc,
    autresServiceExternes: autresServices,
    fraisReception: reception,
    fournituresDeBureau: bureau,
    documentationEtFormation: documentation,
    fraisPostaux: postaux,
    cotisationsSociales: cotisations,
    taxesProfessionnelles: taxes,
    chargesFinancieres: chargesFin,
    pertesExceptionnelles: pertes,
    totalDepenses,
    beneficeOuDeficit: subtract(totalRecettes, totalDepenses),
  };
}

export function compute2035B(immobilisations: readonly Immo2035Line[]): Form2035B {
  let totalVO = ZERO;
  let totalAmortAnnee = ZERO;
  let totalAmortCumul = ZERO;
  let totalVN = ZERO;

  for (const immo of immobilisations) {
    totalVO = add(totalVO, immo.valeurOrigine);
    totalAmortAnnee = add(totalAmortAnnee, immo.amortissementAnnee);
    totalAmortCumul = add(totalAmortCumul, immo.amortissementsCumules);
    totalVN = add(totalVN, immo.valeurNette);
  }

  return {
    _tag: "Form2035B",
    immobilisations,
    totalValeurOrigine: totalVO,
    totalAmortissementAnnee: totalAmortAnnee,
    totalAmortissementsCumules: totalAmortCumul,
    totalValeurNette: totalVN,
  };
}

export function compute2035(
  input: Compute2035AInput & {
    readonly siren: string;
    readonly denomination: string;
    readonly activite: string;
    readonly exerciceDateDebut: Date;
    readonly exerciceDateFin: Date;
    readonly immobilisations: readonly Immo2035Line[];
  },
): Form2035 {
  const form2035A = compute2035A(input);
  const form2035B = compute2035B(input.immobilisations);

  // Résultat fiscal = Bénéfice from 2035-A (recettes - dépenses).
  // Amortissements are reported separately in 2035-B but NOT subtracted again here,
  // as they are already included in dépenses for cash-basis BNC accounting.
  const resultatFiscal = form2035A.beneficeOuDeficit;

  return {
    _tag: "Form2035",
    exercice: { dateDebut: input.exerciceDateDebut, dateFin: input.exerciceDateFin },
    siren: input.siren,
    denomination: input.denomination,
    activite: input.activite,
    form2035A,
    form2035B,
    resultatFiscal,
  };
}
