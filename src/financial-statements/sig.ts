/**
 * Soldes Intermédiaires de Gestion (SIG)
 * Computed from trial balance per PCG format
 */

import { add, subtract } from "@autonomynexus/monetary";
import type { MonetaryAmount } from "../models.js";
import type { TrialBalance } from "../engine/models.js";
import { getAccountPrefixBalance, getCreditBalance, getDebitBalance } from "../engine/computations.js";

// ZERO not needed — helpers return ZERO from engine computations

// ============================================================================
// SIG Model
// ============================================================================

export type SIG = {
  readonly margeCommerciale: MonetaryAmount;
  readonly productionExercice: MonetaryAmount;
  readonly valeurAjoutee: MonetaryAmount;
  readonly excedentBrutExploitation: MonetaryAmount;
  readonly resultatExploitation: MonetaryAmount;
  readonly resultatCourantAvantImpots: MonetaryAmount;
  readonly resultatExceptionnel: MonetaryAmount;
  readonly resultatNet: MonetaryAmount;
};

// ============================================================================
// SIG Computation
// ============================================================================

/**
 * Compute SIG from trial balance.
 *
 * All amounts are from the credit side for revenue (class 7)
 * and debit side for expenses (class 6).
 */
export function computeSIG(tb: TrialBalance): SIG {
  // Helper: credit balance for revenue accounts (returns positive)
  const rev = (prefix: string) => getCreditBalance(tb, prefix);
  // Helper: debit balance for expense accounts (returns positive)
  const exp = (prefix: string) => getDebitBalance(tb, prefix);

  // === Marge commerciale ===
  // Ventes de marchandises (707) - Coût d'achat des marchandises vendues (607 + 6037)
  const ventesMarchandises = rev("707");
  const achatsMarchandises = exp("607");
  const variationStockMarchandises = getAccountPrefixBalance(tb, "6037"); // debit=increase, credit=decrease
  const margeCommerciale = subtract(ventesMarchandises, add(achatsMarchandises, variationStockMarchandises));

  // === Production de l'exercice ===
  // Production vendue (701+702+703+704+705+706+708) + Production stockée (71) + Production immobilisée (72)
  const productionVendue = add(
    add(add(add(add(add(rev("701"), rev("702")), rev("703")), rev("704")), rev("705")), rev("706")),
    rev("708"),
  );
  const productionStockee = getCreditBalance(tb, "71");
  const productionImmobilisee = rev("72");
  const productionExercice = add(add(productionVendue, productionStockee), productionImmobilisee);

  // === Valeur ajoutée ===
  // Marge commerciale + Production - Consommations en provenance de tiers (60 sauf 607/6037 + 61 + 62)
  const achats = add(add(add(exp("601"), exp("602")), exp("604")), add(add(exp("605"), exp("606")), exp("608")));
  const variation6031_6032 = add(getAccountPrefixBalance(tb, "6031"), getAccountPrefixBalance(tb, "6032"));
  const servicesExt = add(exp("61"), exp("62"));
  const consommations = add(add(achats, variation6031_6032), servicesExt);
  const valeurAjoutee = subtract(add(margeCommerciale, productionExercice), consommations);

  // === EBE (Excédent Brut d'Exploitation) ===
  // VA + Subventions d'exploitation (74) - Impôts et taxes (63) - Charges de personnel (64)
  const subventions = rev("74");
  const impotsTaxes = exp("63");
  const chargesPersonnel = exp("64");
  const ebe = subtract(add(valeurAjoutee, subventions), add(impotsTaxes, chargesPersonnel));

  // === Résultat d'exploitation ===
  // EBE + Autres produits (75) + Reprises exploitation (781) + Transferts charges (791)
  //   - Autres charges (65) - Dotations exploitation (681)
  const excedentBrutExploitation = ebe;
  const autresProduits = rev("75");
  const reprisesExploitation = rev("781");
  const transfertsChargesExpl = rev("791");
  const autresCharges = exp("65");
  const dotationsExploitation = exp("681");
  const resultatExploitation = subtract(
    add(add(add(excedentBrutExploitation, autresProduits), reprisesExploitation), transfertsChargesExpl),
    add(autresCharges, dotationsExploitation),
  );

  // === Résultat courant avant impôts ===
  // RE + Produits financiers (76+786+796) - Charges financières (66+686)
  const produitsFinanciers = add(add(rev("76"), rev("786")), rev("796"));
  const chargesFinancieres = add(exp("66"), exp("686"));
  const resultatCourantAvantImpots = add(resultatExploitation, subtract(produitsFinanciers, chargesFinancieres));

  // === Résultat exceptionnel ===
  // Produits exceptionnels (77+787+797) - Charges exceptionnelles (67+687)
  const produitsExceptionnels = add(add(rev("77"), rev("787")), rev("797"));
  const chargesExceptionnelles = add(exp("67"), exp("687"));
  const resultatExceptionnel = subtract(produitsExceptionnels, chargesExceptionnelles);

  // === Résultat net ===
  // Résultat courant + Résultat exceptionnel - Participation (691) - IS (695)
  const participation = exp("691");
  const impotBenefices = exp("695");
  const resultatNet = subtract(
    add(resultatCourantAvantImpots, resultatExceptionnel),
    add(participation, impotBenefices),
  );

  return {
    margeCommerciale,
    productionExercice,
    valeurAjoutee,
    excedentBrutExploitation: ebe,
    resultatExploitation,
    resultatCourantAvantImpots,
    resultatExceptionnel,
    resultatNet,
  };
}
