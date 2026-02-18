/**
 * Liasse Fiscale Computation — IS Regime
 * Computes forms 2050-2059 from trial balance
 */

import { add, EUR, monetary, subtract, greaterThan } from "monetary";
import type { MonetaryAmount } from "../models.js";
import type { TrialBalance } from "../engine/models.js";
import {
  getAccountPrefixBalance,
  getDebitBalance,
  getCreditBalance,
} from "../engine/computations.js";
import type {
  Form2050,
  Form2051,
  Form2052,
  Form2053,
  Form2058A,
  BilanActifLine,
  BilanPassifLine,
} from "./models.js";

const ZERO = monetary({ amount: 0, currency: EUR });

// ============================================================================
// Helpers
// ============================================================================

function actifLine(
  label: string,
  brut: MonetaryAmount,
  amort: MonetaryAmount,
): BilanActifLine {
  return {
    label,
    brut,
    amortissementsProvisions: amort,
    net: subtract(brut, amort),
  };
}

function passifLine(label: string, montant: MonetaryAmount): BilanPassifLine {
  return { label, montant };
}

// ============================================================================
// 2050 — Bilan Actif
// ============================================================================

export function computeForm2050(tb: TrialBalance): Form2050 {
  // Immobilisations incorporelles (20)
  const immosIncorpBrut = getDebitBalance(tb, "20");
  const immosIncorpAmort = getCreditBalance(tb, "280");
  const immosIncorpDeprec = getCreditBalance(tb, "290");
  const immosIncorp = actifLine(
    "Immobilisations incorporelles",
    immosIncorpBrut,
    add(immosIncorpAmort, immosIncorpDeprec),
  );

  // Immobilisations corporelles (21+22+23)
  const immosCorpBrut = add(add(getDebitBalance(tb, "21"), getDebitBalance(tb, "22")), getDebitBalance(tb, "23"));
  const immosCorpAmort = add(getCreditBalance(tb, "281"), getCreditBalance(tb, "282"));
  const immosCorpDeprec = add(add(getCreditBalance(tb, "291"), getCreditBalance(tb, "292")), getCreditBalance(tb, "293"));
  const immosCorp = actifLine(
    "Immobilisations corporelles",
    immosCorpBrut,
    add(immosCorpAmort, immosCorpDeprec),
  );

  // Immobilisations financières (25+26+27)
  const immosFinBrut = add(add(getDebitBalance(tb, "25"), getDebitBalance(tb, "26")), getDebitBalance(tb, "27"));
  const immosFinDeprec = add(getCreditBalance(tb, "296"), getCreditBalance(tb, "297"));
  const immosFin = actifLine("Immobilisations financières", immosFinBrut, immosFinDeprec);

  const totalActifImmoBrut = add(add(immosIncorpBrut, immosCorpBrut), immosFinBrut);
  const totalActifImmoAmort = add(add(immosIncorp.amortissementsProvisions, immosCorp.amortissementsProvisions), immosFin.amortissementsProvisions);
  const totalActifImmo = actifLine("Total actif immobilisé", totalActifImmoBrut, totalActifImmoAmort);

  // Stocks (31-38)
  const stocksBrut = add(
    add(add(getDebitBalance(tb, "31"), getDebitBalance(tb, "32")), add(getDebitBalance(tb, "33"), getDebitBalance(tb, "34"))),
    add(add(getDebitBalance(tb, "35"), getDebitBalance(tb, "36")), add(getDebitBalance(tb, "37"), getDebitBalance(tb, "38"))),
  );
  const stocksDeprec = getCreditBalance(tb, "39");
  const stocks = actifLine("Stocks et en-cours", stocksBrut, stocksDeprec);

  // Créances clients (411+413+416+418)
  const clientsBrut = add(
    add(getDebitBalance(tb, "411"), getDebitBalance(tb, "413")),
    add(getDebitBalance(tb, "416"), getDebitBalance(tb, "418")),
  );
  const clientsDeprec = getCreditBalance(tb, "491");
  const creancesClients = actifLine("Créances clients et comptes rattachés", clientsBrut, clientsDeprec);

  // Autres créances
  const autresCreancesBrut = add(
    add(getDebitBalance(tb, "409"), getDebitBalance(tb, "425")),
    add(add(getDebitBalance(tb, "441"), getDebitBalance(tb, "443")), add(getDebitBalance(tb, "4456"), getDebitBalance(tb, "46"))),
  );
  const autresCreancesDeprec = add(getCreditBalance(tb, "495"), getCreditBalance(tb, "496"));
  const autresCreances = actifLine("Autres créances", autresCreancesBrut, autresCreancesDeprec);

  // Disponibilités (50+51+53+54)
  const dispoBrut = add(
    add(getDebitBalance(tb, "50"), getDebitBalance(tb, "51")),
    add(getDebitBalance(tb, "53"), getDebitBalance(tb, "54")),
  );
  const dispoDeprec = add(getCreditBalance(tb, "590"), getCreditBalance(tb, "591"));
  const disponibilites = actifLine("Valeurs mobilières de placement + Disponibilités", dispoBrut, dispoDeprec);

  // Charges constatées d'avance
  const ccaBrut = getDebitBalance(tb, "486");
  const chargesConstatees = actifLine("Charges constatées d'avance", ccaBrut, ZERO);

  const totalActifCircBrut = add(add(add(stocksBrut, clientsBrut), add(autresCreancesBrut, dispoBrut)), ccaBrut);
  const totalActifCircAmort = add(add(add(stocksDeprec, clientsDeprec), add(autresCreancesDeprec, dispoDeprec)), ZERO);
  const totalActifCirc = actifLine("Total actif circulant", totalActifCircBrut, totalActifCircAmort);

  const totalActif = actifLine(
    "TOTAL ACTIF",
    add(totalActifImmoBrut, totalActifCircBrut),
    add(totalActifImmoAmort, totalActifCircAmort),
  );

  return {
    _tag: "Form2050",
    immobilisationsIncorporelles: immosIncorp,
    immobilisationsCorporelles: immosCorp,
    immobilisationsFinancieres: immosFin,
    totalActifImmobilise: totalActifImmo,
    stocks,
    creancesClients,
    autresCreances,
    disponibilites,
    chargesConstatees,
    totalActifCirculant: totalActifCirc,
    totalActif,
  };
}

// ============================================================================
// 2051 — Bilan Passif
// ============================================================================

export function computeForm2051(tb: TrialBalance): Form2051 {
  const capitalSocial = passifLine("Capital social ou individuel", getCreditBalance(tb, "101"));
  const reserves = passifLine("Réserves", add(add(getCreditBalance(tb, "104"), getCreditBalance(tb, "105")), getCreditBalance(tb, "106")));

  // Report à nouveau: 110 (créditeur) or 119 (débiteur)
  const ran110 = getCreditBalance(tb, "110");
  const ran119 = getDebitBalance(tb, "119");
  const reportANouveau = passifLine("Report à nouveau", subtract(ran110, ran119));

  // Résultat: from class 7 - class 6 (already closed if at year-end)
  const resultat120 = getCreditBalance(tb, "120");
  const resultat129 = getDebitBalance(tb, "129");
  const resultatExercice = passifLine("Résultat de l'exercice", subtract(resultat120, resultat129));

  // Subventions d'investissement
  const subvInvest = getCreditBalance(tb, "13");

  const totalCapitauxPropres = passifLine(
    "Total capitaux propres",
    add(
      add(add(capitalSocial.montant, reserves.montant), reportANouveau.montant),
      add(resultatExercice.montant, subvInvest),
    ),
  );

  // Provisions
  const provisions = passifLine(
    "Provisions pour risques et charges",
    add(getCreditBalance(tb, "14"), getCreditBalance(tb, "15")),
  );

  // Emprunts et dettes financières
  const emprunts = passifLine(
    "Emprunts et dettes financières",
    add(add(getCreditBalance(tb, "16"), getCreditBalance(tb, "17")), getCreditBalance(tb, "519")),
  );

  // Dettes fournisseurs
  const dettesFournisseurs = passifLine(
    "Dettes fournisseurs et comptes rattachés",
    add(getCreditBalance(tb, "401"), add(getCreditBalance(tb, "403"), add(getCreditBalance(tb, "404"), getCreditBalance(tb, "408")))),
  );

  // Dettes fiscales et sociales
  const dettesFiscalesSociales = passifLine(
    "Dettes fiscales et sociales",
    add(
      add(getCreditBalance(tb, "42"), getCreditBalance(tb, "43")),
      add(getCreditBalance(tb, "44"), getCreditBalance(tb, "447")),
    ),
  );

  // Autres dettes
  const autresDettes = passifLine(
    "Autres dettes",
    add(add(getCreditBalance(tb, "419"), getCreditBalance(tb, "455")), getCreditBalance(tb, "46")),
  );

  // Produits constatés d'avance
  const produitsConstates = passifLine("Produits constatés d'avance", getCreditBalance(tb, "487"));

  const totalDettes = passifLine(
    "Total dettes",
    add(
      add(add(emprunts.montant, dettesFournisseurs.montant), dettesFiscalesSociales.montant),
      add(autresDettes.montant, produitsConstates.montant),
    ),
  );

  const totalPassif = passifLine(
    "TOTAL PASSIF",
    add(add(totalCapitauxPropres.montant, provisions.montant), totalDettes.montant),
  );

  return {
    _tag: "Form2051",
    capitalSocial,
    reserves,
    reportANouveau,
    resultatExercice,
    totalCapitauxPropres,
    provisions,
    emprunts,
    dettesFournisseurs,
    dettesFiscalesSociales,
    autresDettes,
    produitsConstates,
    totalDettes,
    totalPassif,
  };
}

// ============================================================================
// 2052 — Compte de Résultat (Charges)
// ============================================================================

export function computeForm2052(tb: TrialBalance): Form2052 {
  const exp = (prefix: string) => getDebitBalance(tb, prefix);

  const achatsMarchandises = exp("607");
  const variationStockMarchandises = getAccountPrefixBalance(tb, "6037");
  const achatsMatieresPremieres = add(exp("601"), exp("602"));
  const variationStockMatieres = add(getAccountPrefixBalance(tb, "6031"), getAccountPrefixBalance(tb, "6032"));
  const autresAchatsChargesExternes = add(add(add(exp("604"), exp("605")), add(exp("606"), exp("608"))), add(exp("61"), exp("62")));
  const impotsTaxes = exp("63");
  const salaires = exp("641");
  const chargesSociales = add(exp("645"), add(exp("646"), exp("647")));
  const dotationsAmortissementsProvisions = exp("68");
  const autresCharges = add(exp("65"), exp("648"));
  const chargesFinancieres = exp("66");
  const chargesExceptionnelles = exp("67");
  const impotBenefices = exp("695");

  const totalCharges = add(
    add(
      add(add(achatsMarchandises, variationStockMarchandises), add(achatsMatieresPremieres, variationStockMatieres)),
      add(add(autresAchatsChargesExternes, impotsTaxes), add(salaires, chargesSociales)),
    ),
    add(
      add(dotationsAmortissementsProvisions, autresCharges),
      add(add(chargesFinancieres, chargesExceptionnelles), impotBenefices),
    ),
  );

  return {
    _tag: "Form2052",
    achatsMarchandises,
    variationStockMarchandises,
    achatsMatieresPremieres,
    variationStockMatieres,
    autresAchatsChargesExternes,
    impotsTaxes,
    salaires,
    chargesSociales,
    dotationsAmortissementsProvisions,
    autresCharges,
    chargesFinancieres,
    chargesExceptionnelles,
    impotBenefices,
    totalCharges,
  };
}

// ============================================================================
// 2053 — Compte de Résultat (Produits)
// ============================================================================

export function computeForm2053(tb: TrialBalance): Form2053 {
  const rev = (prefix: string) => getCreditBalance(tb, prefix);

  const ventesMarchandises = rev("707");
  const productionVendueBiens = add(add(rev("701"), rev("702")), rev("703"));
  const productionVendueServices = add(add(rev("704"), rev("705")), rev("706"));
  const productionStockee = getCreditBalance(tb, "71");
  const productionImmobilisee = rev("72");
  const subventionsExploitation = rev("74");
  const reprisesProvisions = rev("78");
  const autresProduits = add(rev("75"), rev("79"));
  const produitsFinanciers = rev("76");
  const produitsExceptionnels = rev("77");

  const totalProduits = add(
    add(
      add(add(ventesMarchandises, productionVendueBiens), add(productionVendueServices, productionStockee)),
      add(productionImmobilisee, subventionsExploitation),
    ),
    add(add(reprisesProvisions, autresProduits), add(produitsFinanciers, produitsExceptionnels)),
  );

  const form2052 = computeForm2052(tb);
  const resultat = subtract(totalProduits, form2052.totalCharges);

  return {
    _tag: "Form2053",
    ventesMarchandises,
    productionVendueBiens,
    productionVendueServices,
    productionStockee,
    productionImmobilisee,
    subventionsExploitation,
    reprisesProvisions,
    autresProduits,
    produitsFinanciers,
    produitsExceptionnels,
    totalProduits,
    resultat,
  };
}

// ============================================================================
// 2058-A — Détermination du résultat fiscal
// ============================================================================

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

export function computeForm2058A(
  tb: TrialBalance,
  adjustments: ResultatFiscalAdjustments,
): Form2058A {
  // Résultat comptable from 2053
  const form2053 = computeForm2053(tb);
  const resultatComptable = form2053.resultat;

  const totalReintegrations = add(
    add(
      add(adjustments.remunerationExploitant, adjustments.chargesNonDeductibles),
      add(adjustments.amortissementsExcedentaires, adjustments.provisionsNonDeductibles),
    ),
    adjustments.autresReintegrations,
  );

  const totalDeductions = add(
    add(adjustments.produitsNonImposables, adjustments.deficitsAnterieurs),
    adjustments.autresDeductions,
  );

  const resultatFiscal = subtract(add(resultatComptable, totalReintegrations), totalDeductions);
  const deficitReportable = greaterThan(ZERO, resultatFiscal) ? subtract(ZERO, resultatFiscal) : ZERO;

  return {
    _tag: "Form2058A",
    resultatComptable,
    reintegrations: {
      remunerationExploitant: adjustments.remunerationExploitant,
      chargesNonDeductibles: adjustments.chargesNonDeductibles,
      amortissementsExcedentaires: adjustments.amortissementsExcedentaires,
      provisionsNonDeductibles: adjustments.provisionsNonDeductibles,
      autresReintegrations: adjustments.autresReintegrations,
      totalReintegrations,
    },
    deductions: {
      produitsNonImposables: adjustments.produitsNonImposables,
      deficitsAnterieurs: adjustments.deficitsAnterieurs,
      autresDeductions: adjustments.autresDeductions,
      totalDeductions,
    },
    resultatFiscal,
    deficitReportable,
  };
}
