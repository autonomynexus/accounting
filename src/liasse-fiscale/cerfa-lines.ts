/**
 * CERFA Line Code Mapping for Liasse Fiscale (IS — Régime Normal)
 *
 * Canonical line codes per official CERFA forms:
 *   - 2050 (Bilan Actif): CERFA 10937, lines AA–EK
 *   - 2051 (Bilan Passif): CERFA 10938, lines DA–FL
 *   - 2052 (Compte de Résultat — Charges): CERFA 10167, lines FA–GG
 *   - 2053 (Compte de Résultat — Produits): CERFA 10168, lines HA–HN
 *
 * Source: DGFiP CERFA forms 2024/2025 — liasse fiscale BIC/IS régime réel normal.
 * Each line code is the two-letter code printed on the official form.
 */

import type { MonetaryAmount } from "../models.js";

// ============================================================================
// 2050 — Bilan Actif (CERFA 10937)
// ============================================================================

/**
 * Line codes for CERFA 2050 — Bilan Actif.
 * Source: CERFA 10937*25 (2024 edition), DGFiP.
 *
 * The 2050 has 3 columns per line: Brut, Amortissements/Provisions, Net.
 * Lines AA–CX are individual asset categories; lines CO–EE are subtotals/totals.
 */
export type Form2050Line =
  // Immobilisations incorporelles
  | "AA" // Frais d'établissement
  | "AB" // Frais de développement
  | "AC" // Concessions, brevets, licences, marques, procédés, logiciels, droits et valeurs similaires
  | "AD" // Fonds commercial
  | "AE" // Autres immobilisations incorporelles
  | "AF" // Avances et acomptes sur immobilisations incorporelles
  // Immobilisations corporelles
  | "AG" // Terrains
  | "AH" // Constructions
  | "AI" // Installations techniques, matériel et outillage industriels
  | "AJ" // Autres immobilisations corporelles
  | "AK" // Immobilisations en cours
  | "AL" // Avances et acomptes
  // Immobilisations financières
  | "AM" // Participations évaluées par mise en équivalence
  | "AN" // Autres participations
  | "AO" // Créances rattachées à des participations
  | "AP" // Autres titres immobilisés
  | "AQ" // Prêts
  | "AR" // Autres immobilisations financières
  // Total actif immobilisé
  | "AS" // TOTAL I (Actif immobilisé)
  // Actif circulant — Stocks
  | "AT" // Matières premières, approvisionnements
  | "AU" // En-cours de production de biens
  | "AV" // En-cours de production de services
  | "AW" // Produits intermédiaires et finis
  | "AX" // Marchandises
  // Actif circulant — Créances
  | "AY" // Avances et acomptes versés sur commandes
  | "AZ" // Clients et comptes rattachés
  | "BA" // Autres créances
  | "BB" // Capital souscrit — appelé, non versé
  // Actif circulant — Divers
  | "BC" // Valeurs mobilières de placement
  | "BD" // Disponibilités
  | "BE" // Charges constatées d'avance
  // Total actif circulant
  | "BF" // TOTAL II (Actif circulant)
  // Charges à répartir
  | "BG" // Charges à répartir sur plusieurs exercices (III)
  // Primes de remboursement
  | "BH" // Primes de remboursement des obligations (IV)
  // Écarts de conversion
  | "BI" // Écarts de conversion Actif (V)
  // Total général
  | "BJ"; // TOTAL GÉNÉRAL (I + II + III + IV + V)

/**
 * Value structure for CERFA 2050 lines.
 * The 2050 has 3 value columns (Brut, Amortissements/Provisions, Net)
 * plus an optional N-1 Net column.
 */
export type Form2050LineValue = {
  readonly brut: MonetaryAmount;
  readonly amortissementsProvisions: MonetaryAmount;
  readonly net: MonetaryAmount;
  readonly netN1?: MonetaryAmount;
};

// ============================================================================
// 2051 — Bilan Passif (CERFA 10938)
// ============================================================================

/**
 * Line codes for CERFA 2051 — Bilan Passif.
 * Source: CERFA 10938*25 (2024 edition), DGFiP.
 */
export type Form2051Line =
  // Capitaux propres
  | "DA" // Capital social ou individuel
  | "DB" // Primes d'émission, de fusion, d'apport, …
  | "DC" // Écarts de réévaluation
  | "DD" // Réserve légale
  | "DE" // Réserves statutaires ou contractuelles
  | "DF" // Réserves réglementées
  | "DG" // Autres réserves
  | "DH" // Report à nouveau
  | "DI" // Résultat de l'exercice
  | "DJ" // Subventions d'investissement
  | "DK" // Provisions réglementées
  | "DL" // TOTAL I (Capitaux propres)
  // Autres fonds propres
  | "DM" // Produit des émissions de titres participatifs
  | "DN" // Avances conditionnées
  | "DO" // TOTAL I bis (Autres fonds propres)
  // Provisions
  | "DP" // Provisions pour risques
  | "DQ" // Provisions pour charges
  | "DR" // TOTAL II (Provisions)
  // Dettes
  | "DS" // Emprunts obligataires convertibles
  | "DT" // Autres emprunts obligataires
  | "DU" // Emprunts et dettes auprès des établissements de crédit
  | "DV" // Emprunts et dettes financières divers
  | "DW" // Avances et acomptes reçus sur commandes en cours
  | "DX" // Dettes fournisseurs et comptes rattachés
  | "DY" // Dettes fiscales et sociales
  | "DZ" // Dettes sur immobilisations et comptes rattachés
  | "EA" // Autres dettes
  | "EB" // Produits constatés d'avance
  | "EC" // TOTAL III (Dettes)
  // Écarts de conversion
  | "ED" // Écarts de conversion Passif (IV)
  // Total général
  | "EE"; // TOTAL GÉNÉRAL (I + I bis + II + III + IV)

/**
 * Value structure for CERFA 2051 lines.
 * The 2051 has 2 value columns: Montant N, Montant N-1.
 */
export type Form2051LineValue = {
  readonly montant: MonetaryAmount;
  readonly montantN1?: MonetaryAmount;
};

// ============================================================================
// 2052 — Compte de Résultat — Charges (CERFA 10167)
// ============================================================================

/**
 * Line codes for CERFA 2052 — Compte de Résultat (Charges).
 * Source: CERFA 10167*25 (2024 edition), DGFiP.
 */
export type Form2052Line =
  // Charges d'exploitation
  | "FA" // Achats de marchandises (y compris droits de douane)
  | "FB" // Variation de stock (marchandises)
  | "FC" // Achats de matières premières et autres approvisionnements
  | "FD" // Variation de stock (matières premières et approvisionnements)
  | "FE" // Autres achats et charges externes
  | "FF" // Impôts, taxes et versements assimilés
  | "FG" // Salaires et traitements
  | "FH" // Charges sociales
  // Dotations aux amortissements et provisions
  | "FI" // Sur immobilisations: dotations aux amortissements
  | "FJ" // Sur immobilisations: dotations aux provisions
  | "FK" // Sur actif circulant: dotations aux provisions
  | "FL" // Pour risques et charges: dotations aux provisions
  | "FM" // Autres charges
  | "FN" // TOTAL I — Charges d'exploitation
  // Quotes-parts
  | "FO" // Quotes-parts de résultat sur opérations faites en commun
  // Charges financières
  | "FP" // Dotations financières aux amortissements et provisions
  | "FQ" // Intérêts et charges assimilées
  | "FR" // Différences négatives de change
  | "FS" // Charges nettes sur cessions de valeurs mobilières de placement
  | "FT" // TOTAL II — Charges financières
  // Charges exceptionnelles
  | "FU" // Sur opérations de gestion
  | "FV" // Sur opérations en capital
  | "FW" // Dotations exceptionnelles aux amortissements et provisions
  | "FX" // TOTAL III — Charges exceptionnelles
  // Impôt et participation
  | "FY" // Participation des salariés aux résultats de l'entreprise (IV)
  | "FZ" // Impôts sur les bénéfices (V)
  // Total
  | "GA" // TOTAL DES CHARGES (I + II + III + IV + V)
  // Soldes
  | "GB" // Solde créditeur = bénéfice comptable
  | "GC" // Solde débiteur = perte comptable
  | "GD" // Crédit-bail mobilier
  | "GE" // Crédit-bail immobilier
  | "GF" // Personnel extérieur à l'entreprise
  | "GG"; // Rémunérations d'intermédiaires et honoraires

/**
 * Value structure for CERFA 2052 lines.
 * The 2052 has 2 value columns: Montant N, Montant N-1.
 */
export type Form2052LineValue = {
  readonly montant: MonetaryAmount;
  readonly montantN1?: MonetaryAmount;
};

// ============================================================================
// 2053 — Compte de Résultat — Produits (CERFA 10168)
// ============================================================================

/**
 * Line codes for CERFA 2053 — Compte de Résultat (Produits).
 * Source: CERFA 10168*25 (2024 edition), DGFiP.
 */
export type Form2053Line =
  // Produits d'exploitation
  | "HA" // Ventes de marchandises
  | "HB" // Production vendue — biens
  | "HC" // Production vendue — services
  | "HD" // Chiffre d'affaires net (HA + HB + HC)
  | "HE" // Production stockée
  | "HF" // Production immobilisée
  | "HG" // Subventions d'exploitation
  | "HH" // Reprises sur provisions (et amortissements), transferts de charges
  | "HI" // Autres produits
  | "HJ" // TOTAL I — Produits d'exploitation
  // Quotes-parts
  | "HK" // Quotes-parts de résultat sur opérations faites en commun
  // Produits financiers
  | "HL" // Produits financiers (total)
  // Produits exceptionnels
  | "HM" // Produits exceptionnels (total)
  // Total
  | "HN"; // TOTAL DES PRODUITS (I + II + III)

/**
 * Value structure for CERFA 2053 lines.
 * The 2053 has 2 value columns: Montant N, Montant N-1.
 */
export type Form2053LineValue = {
  readonly montant: MonetaryAmount;
  readonly montantN1?: MonetaryAmount;
};

// ============================================================================
// CERFA Line Labels — French display labels
// ============================================================================

/**
 * French labels for all CERFA line codes across forms 2050-2053.
 * Used for rendering, export, and human-readable output.
 */
export const CERFA_LINE_LABELS: Record<
  Form2050Line | Form2051Line | Form2052Line | Form2053Line,
  string
> = {
  // 2050 — Bilan Actif
  AA: "Frais d'établissement",
  AB: "Frais de développement",
  AC: "Concessions, brevets, licences, marques, procédés, logiciels, droits et valeurs similaires",
  AD: "Fonds commercial",
  AE: "Autres immobilisations incorporelles",
  AF: "Avances et acomptes sur immobilisations incorporelles",
  AG: "Terrains",
  AH: "Constructions",
  AI: "Installations techniques, matériel et outillage industriels",
  AJ: "Autres immobilisations corporelles",
  AK: "Immobilisations en cours",
  AL: "Avances et acomptes (immobilisations corporelles)",
  AM: "Participations évaluées par mise en équivalence",
  AN: "Autres participations",
  AO: "Créances rattachées à des participations",
  AP: "Autres titres immobilisés",
  AQ: "Prêts",
  AR: "Autres immobilisations financières",
  AS: "TOTAL (I) — Actif immobilisé",
  AT: "Matières premières, approvisionnements",
  AU: "En-cours de production de biens",
  AV: "En-cours de production de services",
  AW: "Produits intermédiaires et finis",
  AX: "Marchandises",
  AY: "Avances et acomptes versés sur commandes",
  AZ: "Clients et comptes rattachés",
  BA: "Autres créances",
  BB: "Capital souscrit — appelé, non versé",
  BC: "Valeurs mobilières de placement",
  BD: "Disponibilités",
  BE: "Charges constatées d'avance",
  BF: "TOTAL (II) — Actif circulant",
  BG: "Charges à répartir sur plusieurs exercices (III)",
  BH: "Primes de remboursement des obligations (IV)",
  BI: "Écarts de conversion Actif (V)",
  BJ: "TOTAL GÉNÉRAL (I + II + III + IV + V)",

  // 2051 — Bilan Passif
  DA: "Capital social ou individuel",
  DB: "Primes d'émission, de fusion, d'apport, …",
  DC: "Écarts de réévaluation",
  DD: "Réserve légale",
  DE: "Réserves statutaires ou contractuelles",
  DF: "Réserves réglementées",
  DG: "Autres réserves",
  DH: "Report à nouveau",
  DI: "Résultat de l'exercice",
  DJ: "Subventions d'investissement",
  DK: "Provisions réglementées",
  DL: "TOTAL (I) — Capitaux propres",
  DM: "Produit des émissions de titres participatifs",
  DN: "Avances conditionnées",
  DO: "TOTAL (I bis) — Autres fonds propres",
  DP: "Provisions pour risques",
  DQ: "Provisions pour charges",
  DR: "TOTAL (II) — Provisions pour risques et charges",
  DS: "Emprunts obligataires convertibles",
  DT: "Autres emprunts obligataires",
  DU: "Emprunts et dettes auprès des établissements de crédit",
  DV: "Emprunts et dettes financières divers",
  DW: "Avances et acomptes reçus sur commandes en cours",
  DX: "Dettes fournisseurs et comptes rattachés",
  DY: "Dettes fiscales et sociales",
  DZ: "Dettes sur immobilisations et comptes rattachés",
  EA: "Autres dettes",
  EB: "Produits constatés d'avance",
  EC: "TOTAL (III) — Dettes",
  ED: "Écarts de conversion Passif (IV)",
  EE: "TOTAL GÉNÉRAL (I + I bis + II + III + IV)",

  // 2052 — Charges
  FA: "Achats de marchandises (y compris droits de douane)",
  FB: "Variation de stock (marchandises)",
  FC: "Achats de matières premières et autres approvisionnements",
  FD: "Variation de stock (matières premières et approvisionnements)",
  FE: "Autres achats et charges externes",
  FF: "Impôts, taxes et versements assimilés",
  FG: "Salaires et traitements",
  FH: "Charges sociales",
  FI: "Dotations aux amortissements sur immobilisations",
  FJ: "Dotations aux provisions sur immobilisations",
  FK: "Dotations aux provisions sur actif circulant",
  FL: "Dotations aux provisions pour risques et charges",
  FM: "Autres charges",
  FN: "TOTAL (I) — Charges d'exploitation",
  FO: "Quotes-parts de résultat sur opérations faites en commun",
  FP: "Dotations financières aux amortissements et provisions",
  FQ: "Intérêts et charges assimilées",
  FR: "Différences négatives de change",
  FS: "Charges nettes sur cessions de valeurs mobilières de placement",
  FT: "TOTAL (II) — Charges financières",
  FU: "Charges exceptionnelles sur opérations de gestion",
  FV: "Charges exceptionnelles sur opérations en capital",
  FW: "Dotations exceptionnelles aux amortissements et provisions",
  FX: "TOTAL (III) — Charges exceptionnelles",
  FY: "Participation des salariés aux résultats (IV)",
  FZ: "Impôts sur les bénéfices (V)",
  GA: "TOTAL DES CHARGES (I + II + III + IV + V)",
  GB: "Solde créditeur = bénéfice comptable",
  GC: "Solde débiteur = perte comptable",
  GD: "Crédit-bail mobilier",
  GE: "Crédit-bail immobilier",
  GF: "Personnel extérieur à l'entreprise",
  GG: "Rémunérations d'intermédiaires et honoraires",

  // 2053 — Produits
  HA: "Ventes de marchandises",
  HB: "Production vendue — biens",
  HC: "Production vendue — services",
  HD: "Chiffre d'affaires net",
  HE: "Production stockée",
  HF: "Production immobilisée",
  HG: "Subventions d'exploitation",
  HH: "Reprises sur provisions (et amortissements), transferts de charges",
  HI: "Autres produits",
  HJ: "TOTAL (I) — Produits d'exploitation",
  HK: "Quotes-parts de résultat sur opérations faites en commun",
  HL: "Produits financiers",
  HM: "Produits exceptionnels",
  HN: "TOTAL DES PRODUITS (I + II + III)",
};

// ============================================================================
// CERFA Form Data Types (Record-based)
// ============================================================================

/**
 * Form 2050 data indexed by CERFA line code.
 * Each entry maps a line code to its Brut/Amort/Net values.
 */
export type Form2050CerfaData = Partial<Record<Form2050Line, Form2050LineValue>>;

/**
 * Form 2051 data indexed by CERFA line code.
 */
export type Form2051CerfaData = Partial<Record<Form2051Line, Form2051LineValue>>;

/**
 * Form 2052 data indexed by CERFA line code.
 */
export type Form2052CerfaData = Partial<Record<Form2052Line, Form2052LineValue>>;

/**
 * Form 2053 data indexed by CERFA line code.
 */
export type Form2053CerfaData = Partial<Record<Form2053Line, Form2053LineValue>>;
