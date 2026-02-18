/**
 * Full PCG Chart of Accounts (Plan Comptable Général)
 * Règlement ANC N° 2014-03 — All standard accounts Classes 1-8
 *
 * This is the comprehensive reference. The original chart-of-accounts.ts
 * remains for backward compatibility and re-exports from here.
 */

import type { AccountClass, AccountTypeCode } from "../models.js";

// ============================================================================
// Types
// ============================================================================

/** Account hierarchy level */
export type AccountLevel = "class" | "category" | "subcategory" | "account" | "subaccount";

/** Balance side (sens normal du solde) */
export type BalanceSide = "debit" | "credit";

/** PCG account definition with full metadata */
export type PcgAccountDefinition = {
  readonly code: string;
  readonly name: string;
  readonly class: AccountClass;
  readonly typeId: AccountTypeCode;
  readonly isDebitNormal: boolean;
  readonly parentCode: string | null;
  readonly level: AccountLevel;
  readonly balanceSide: BalanceSide;
};

// ============================================================================
// Helper to define accounts concisely
// ============================================================================

function acc(
  code: string,
  name: string,
  cls: AccountClass,
  typeId: AccountTypeCode,
  isDebitNormal: boolean,
  parentCode: string | null = null,
): PcgAccountDefinition {
  const level: AccountLevel =
    code.length === 1 ? "class" :
    code.length === 2 ? "category" :
    code.length === 3 ? "subcategory" :
    code.length <= 4 ? "account" : "subaccount";
  return {
    code,
    name,
    class: cls,
    typeId,
    isDebitNormal,
    parentCode,
    level,
    balanceSide: isDebitNormal ? "debit" : "credit",
  };
}

// Shorthands
const A = "ASSET" as const;
const L = "LIABILITY" as const;
const E = "EQUITY" as const;
const R = "REVENUE" as const;
const X = "EXPENSE" as const;

// ============================================================================
// CLASS 1 — Comptes de capitaux
// ============================================================================

const CLASS_1: PcgAccountDefinition[] = [
  // 10 — Capital et réserves
  acc("10", "Capital et réserves", 1, E, false),
  acc("101", "Capital social / Capital individuel", 1, E, false, "10"),
  acc("1011", "Capital souscrit non appelé", 1, E, false, "101"),
  acc("1012", "Capital souscrit appelé non versé", 1, E, false, "101"),
  acc("1013", "Capital souscrit appelé versé", 1, E, false, "101"),
  acc("1018", "Capital souscrit soumis à des réglementations particulières", 1, E, false, "101"),
  acc("104", "Primes liées au capital social", 1, E, false, "10"),
  acc("1041", "Primes d'émission", 1, E, false, "104"),
  acc("1042", "Primes de fusion", 1, E, false, "104"),
  acc("1043", "Primes d'apport", 1, E, false, "104"),
  acc("1044", "Primes de conversion d'obligations en actions", 1, E, false, "104"),
  acc("105", "Écarts de réévaluation", 1, E, false, "10"),
  acc("106", "Réserves", 1, E, false, "10"),
  acc("1061", "Réserve légale", 1, E, false, "106"),
  acc("1062", "Réserves indisponibles", 1, E, false, "106"),
  acc("1063", "Réserves statutaires ou contractuelles", 1, E, false, "106"),
  acc("1064", "Réserves réglementées", 1, E, false, "106"),
  acc("1068", "Autres réserves", 1, E, false, "106"),
  acc("107", "Écart d'équivalence", 1, E, false, "10"),
  acc("108", "Compte de l'exploitant", 1, E, false, "10"),
  acc("109", "Actionnaires : capital souscrit non appelé", 1, A, true, "10"),

  // 11 — Report à nouveau
  acc("11", "Report à nouveau", 1, E, false),
  acc("110", "Report à nouveau (solde créditeur)", 1, E, false, "11"),
  acc("119", "Report à nouveau (solde débiteur)", 1, E, true, "11"),

  // 12 — Résultat de l'exercice
  acc("12", "Résultat de l'exercice", 1, E, false),
  acc("120", "Résultat de l'exercice (bénéfice)", 1, E, false, "12"),
  acc("129", "Résultat de l'exercice (perte)", 1, E, true, "12"),

  // 13 — Subventions d'investissement
  acc("13", "Subventions d'investissement", 1, E, false),
  acc("131", "Subventions d'équipement", 1, E, false, "13"),
  acc("138", "Autres subventions d'investissement", 1, E, false, "13"),
  acc("139", "Subventions d'investissement inscrites au compte de résultat", 1, E, true, "13"),

  // 14 — Provisions réglementées
  acc("14", "Provisions réglementées", 1, E, false),
  acc("142", "Provisions réglementées relatives aux immobilisations", 1, E, false, "14"),
  acc("143", "Provisions réglementées relatives aux stocks", 1, E, false, "14"),
  acc("144", "Provisions réglementées relatives aux autres éléments d'actif", 1, E, false, "14"),
  acc("145", "Amortissements dérogatoires", 1, E, false, "14"),
  acc("146", "Provision spéciale de réévaluation", 1, E, false, "14"),
  acc("147", "Plus-values réinvesties", 1, E, false, "14"),
  acc("148", "Autres provisions réglementées", 1, E, false, "14"),

  // 15 — Provisions
  acc("15", "Provisions", 1, L, false),
  acc("151", "Provisions pour risques", 1, L, false, "15"),
  acc("153", "Provisions pour pensions et obligations similaires", 1, L, false, "15"),
  acc("154", "Provisions pour restructurations", 1, L, false, "15"),
  acc("155", "Provisions pour impôts", 1, L, false, "15"),
  acc("156", "Provisions pour renouvellement des immobilisations", 1, L, false, "15"),
  acc("157", "Provisions pour charges à répartir sur plusieurs exercices", 1, L, false, "15"),
  acc("158", "Autres provisions pour charges", 1, L, false, "15"),

  // 16 — Emprunts et dettes assimilées
  acc("16", "Emprunts et dettes assimilées", 1, L, false),
  acc("161", "Emprunts obligataires convertibles", 1, L, false, "16"),
  acc("163", "Autres emprunts obligataires", 1, L, false, "16"),
  acc("164", "Emprunts auprès des établissements de crédit", 1, L, false, "16"),
  acc("165", "Dépôts et cautionnements reçus", 1, L, false, "16"),
  acc("166", "Participation des salariés aux résultats", 1, L, false, "16"),
  acc("167", "Emprunts et dettes assortis de conditions particulières", 1, L, false, "16"),
  acc("1671", "Émissions de titres participatifs", 1, L, false, "167"),
  acc("1674", "Avances conditionnées de l'État", 1, L, false, "167"),
  acc("1675", "Emprunts participatifs", 1, L, false, "167"),
  acc("168", "Autres emprunts et dettes assimilées", 1, L, false, "16"),
  acc("1681", "Autres emprunts", 1, L, false, "168"),
  acc("1685", "Rentes viagères capitalisées", 1, L, false, "168"),
  acc("1688", "Intérêts courus", 1, L, false, "168"),
  acc("169", "Primes de remboursement des obligations", 1, A, true, "16"),

  // 17 — Dettes rattachées à des participations
  acc("17", "Dettes rattachées à des participations", 1, L, false),
  acc("171", "Dettes rattachées à des participations (groupe)", 1, L, false, "17"),
  acc("174", "Dettes rattachées à des participations (hors groupe)", 1, L, false, "17"),
  acc("178", "Dettes rattachées à des sociétés en participation", 1, L, false, "17"),

  // 18 — Comptes de liaison
  acc("18", "Comptes de liaison des établissements et sociétés en participation", 1, E, false),
  acc("181", "Comptes de liaison des établissements", 1, E, false, "18"),
  acc("186", "Biens et prestations de services échangés entre établissements (charges)", 1, X, true, "18"),
  acc("187", "Biens et prestations de services échangés entre établissements (produits)", 1, R, false, "18"),
  acc("188", "Comptes de liaison des sociétés en participation", 1, E, false, "18"),
];

// ============================================================================
// CLASS 2 — Comptes d'immobilisations
// ============================================================================

const CLASS_2: PcgAccountDefinition[] = [
  // 20 — Immobilisations incorporelles
  acc("20", "Immobilisations incorporelles", 2, A, true),
  acc("201", "Frais d'établissement", 2, A, true, "20"),
  acc("203", "Frais de recherche et de développement", 2, A, true, "20"),
  acc("205", "Concessions et droits similaires, brevets, licences, marques, procédés, logiciels", 2, A, true, "20"),
  acc("206", "Droit au bail", 2, A, true, "20"),
  acc("207", "Fonds commercial", 2, A, true, "20"),
  acc("208", "Autres immobilisations incorporelles", 2, A, true, "20"),

  // 21 — Immobilisations corporelles
  acc("21", "Immobilisations corporelles", 2, A, true),
  acc("211", "Terrains", 2, A, true, "21"),
  acc("2111", "Terrains nus", 2, A, true, "211"),
  acc("2112", "Terrains aménagés", 2, A, true, "211"),
  acc("2113", "Sous-sols et sur-sols", 2, A, true, "211"),
  acc("2114", "Terrains de gisement", 2, A, true, "211"),
  acc("2115", "Terrains bâtis", 2, A, true, "211"),
  acc("212", "Agencements et aménagements de terrains", 2, A, true, "21"),
  acc("213", "Constructions", 2, A, true, "21"),
  acc("2131", "Bâtiments", 2, A, true, "213"),
  acc("2135", "Installations générales, agencements, aménagements des constructions", 2, A, true, "213"),
  acc("214", "Constructions sur sol d'autrui", 2, A, true, "21"),
  acc("215", "Installations techniques, matériel et outillage industriels", 2, A, true, "21"),
  acc("2151", "Installations complexes spécialisées", 2, A, true, "215"),
  acc("2154", "Matériel industriel", 2, A, true, "215"),
  acc("2155", "Outillage industriel", 2, A, true, "215"),
  acc("218", "Autres immobilisations corporelles", 2, A, true, "21"),
  acc("2181", "Installations générales, agencements, aménagements divers", 2, A, true, "218"),
  acc("2182", "Matériel de transport", 2, A, true, "218"),
  acc("2183", "Matériel de bureau et matériel informatique", 2, A, true, "218"),
  acc("2184", "Mobilier", 2, A, true, "218"),
  acc("2185", "Cheptel", 2, A, true, "218"),
  acc("2186", "Emballages récupérables", 2, A, true, "218"),

  // 22 — Immobilisations mises en concession
  acc("22", "Immobilisations mises en concession", 2, A, true),
  acc("229", "Droits du concédant", 2, L, false, "22"),

  // 23 — Immobilisations en cours
  acc("23", "Immobilisations en cours", 2, A, true),
  acc("231", "Immobilisations corporelles en cours", 2, A, true, "23"),
  acc("232", "Immobilisations incorporelles en cours", 2, A, true, "23"),
  acc("237", "Avances et acomptes versés sur immobilisations incorporelles", 2, A, true, "23"),
  acc("238", "Avances et acomptes versés sur commandes d'immobilisations corporelles", 2, A, true, "23"),

  // 25 — Parts dans des entreprises liées
  acc("25", "Parts dans des entreprises liées et créances sur des entreprises liées", 2, A, true),

  // 26 — Participations
  acc("26", "Participations et créances rattachées à des participations", 2, A, true),
  acc("261", "Titres de participation", 2, A, true, "26"),
  acc("266", "Autres formes de participation", 2, A, true, "26"),
  acc("267", "Créances rattachées à des participations", 2, A, true, "26"),
  acc("268", "Créances rattachées à des sociétés en participation", 2, A, true, "26"),
  acc("269", "Versements restant à effectuer sur titres de participation non libérés", 2, L, false, "26"),

  // 27 — Autres immobilisations financières
  acc("27", "Autres immobilisations financières", 2, A, true),
  acc("271", "Titres immobilisés autres que TIAP (droit de propriété)", 2, A, true, "27"),
  acc("272", "Titres immobilisés (droit de créance)", 2, A, true, "27"),
  acc("273", "Titres immobilisés de l'activité de portefeuille", 2, A, true, "27"),
  acc("274", "Prêts", 2, A, true, "27"),
  acc("2741", "Prêts participatifs", 2, A, true, "274"),
  acc("2742", "Prêts aux associés", 2, A, true, "274"),
  acc("2743", "Prêts au personnel", 2, A, true, "274"),
  acc("275", "Dépôts et cautionnements versés", 2, A, true, "27"),
  acc("2751", "Dépôts", 2, A, true, "275"),
  acc("2755", "Cautionnements", 2, A, true, "275"),
  acc("276", "Autres créances immobilisées", 2, A, true, "27"),
  acc("277", "Actions propres ou parts propres", 2, A, true, "27"),
  acc("2771", "Actions propres ou parts propres", 2, A, true, "277"),
  acc("2772", "Actions propres ou parts propres en voie d'annulation", 2, A, true, "277"),
  acc("279", "Versements restant à effectuer sur titres immobilisés non libérés", 2, L, false, "27"),

  // 28 — Amortissements des immobilisations
  acc("28", "Amortissements des immobilisations", 2, A, false),
  acc("280", "Amortissements des immobilisations incorporelles", 2, A, false, "28"),
  acc("2801", "Amortissements des frais d'établissement", 2, A, false, "280"),
  acc("2803", "Amortissements des frais de recherche et de développement", 2, A, false, "280"),
  acc("2805", "Amortissements des concessions et droits similaires, brevets, logiciels", 2, A, false, "280"),
  acc("2807", "Amortissements du fonds commercial", 2, A, false, "280"),
  acc("2808", "Amortissements des autres immobilisations incorporelles", 2, A, false, "280"),
  acc("281", "Amortissements des immobilisations corporelles", 2, A, false, "28"),
  acc("2811", "Amortissements des terrains de gisement", 2, A, false, "281"),
  acc("2812", "Amortissements des agencements et aménagements de terrains", 2, A, false, "281"),
  acc("2813", "Amortissements des constructions", 2, A, false, "281"),
  acc("2814", "Amortissements des constructions sur sol d'autrui", 2, A, false, "281"),
  acc("2815", "Amortissements des installations techniques, matériel et outillage", 2, A, false, "281"),
  acc("2818", "Amortissements des autres immobilisations corporelles", 2, A, false, "281"),
  acc("282", "Amortissements des immobilisations mises en concession", 2, A, false, "28"),

  // 29 — Dépréciations des immobilisations
  acc("29", "Dépréciations des immobilisations", 2, A, false),
  acc("290", "Dépréciations des immobilisations incorporelles", 2, A, false, "29"),
  acc("291", "Dépréciations des immobilisations corporelles", 2, A, false, "29"),
  acc("292", "Dépréciations des immobilisations mises en concession", 2, A, false, "29"),
  acc("293", "Dépréciations des immobilisations en cours", 2, A, false, "29"),
  acc("296", "Dépréciations des participations et créances rattachées", 2, A, false, "29"),
  acc("297", "Dépréciations des autres immobilisations financières", 2, A, false, "29"),
];

// ============================================================================
// CLASS 3 — Comptes de stocks et en-cours
// ============================================================================

const CLASS_3: PcgAccountDefinition[] = [
  acc("31", "Matières premières (et fournitures)", 3, A, true),
  acc("311", "Matières premières", 3, A, true, "31"),
  acc("312", "Fournitures", 3, A, true, "31"),
  acc("32", "Autres approvisionnements", 3, A, true),
  acc("321", "Matières consommables", 3, A, true, "32"),
  acc("322", "Fournitures consommables", 3, A, true, "32"),
  acc("326", "Emballages", 3, A, true, "32"),
  acc("33", "En-cours de production de biens", 3, A, true),
  acc("331", "Produits en cours", 3, A, true, "33"),
  acc("335", "Travaux en cours", 3, A, true, "33"),
  acc("34", "En-cours de production de services", 3, A, true),
  acc("341", "Études en cours", 3, A, true, "34"),
  acc("345", "Prestations de services en cours", 3, A, true, "34"),
  acc("35", "Stocks de produits", 3, A, true),
  acc("351", "Produits intermédiaires", 3, A, true, "35"),
  acc("355", "Produits finis", 3, A, true, "35"),
  acc("358", "Produits résiduels", 3, A, true, "35"),
  acc("36", "Stocks provenant d'immobilisations", 3, A, true),
  acc("37", "Stocks de marchandises", 3, A, true),
  acc("38", "Stocks en voie d'acheminement, mis en dépôt ou donnés en consignation", 3, A, true),

  // 39 — Dépréciations des stocks
  acc("39", "Dépréciations des stocks et en-cours", 3, A, false),
  acc("391", "Dépréciations des matières premières", 3, A, false, "39"),
  acc("392", "Dépréciations des autres approvisionnements", 3, A, false, "39"),
  acc("393", "Dépréciations des en-cours de production de biens", 3, A, false, "39"),
  acc("394", "Dépréciations des en-cours de production de services", 3, A, false, "39"),
  acc("395", "Dépréciations des stocks de produits", 3, A, false, "39"),
  acc("397", "Dépréciations des stocks de marchandises", 3, A, false, "39"),
];

// ============================================================================
// CLASS 4 — Comptes de tiers
// ============================================================================

const CLASS_4: PcgAccountDefinition[] = [
  // 40 — Fournisseurs
  acc("40", "Fournisseurs et comptes rattachés", 4, L, false),
  acc("401", "Fournisseurs", 4, L, false, "40"),
  acc("403", "Fournisseurs - Effets à payer", 4, L, false, "40"),
  acc("404", "Fournisseurs d'immobilisations", 4, L, false, "40"),
  acc("405", "Fournisseurs d'immobilisations - Effets à payer", 4, L, false, "40"),
  acc("408", "Fournisseurs - Factures non parvenues", 4, L, false, "40"),
  acc("409", "Fournisseurs débiteurs", 4, A, true, "40"),
  acc("4091", "Fournisseurs - Avances et acomptes versés sur commandes", 4, A, true, "409"),
  acc("4096", "Fournisseurs - Créances pour emballages et matériel à rendre", 4, A, true, "409"),
  acc("4097", "Fournisseurs - Autres avoirs", 4, A, true, "409"),
  acc("4098", "Rabais, remises, ristournes à obtenir et autres avoirs non encore reçus", 4, A, true, "409"),

  // 41 — Clients
  acc("41", "Clients et comptes rattachés", 4, A, true),
  acc("411", "Clients", 4, A, true, "41"),
  acc("413", "Clients - Effets à recevoir", 4, A, true, "41"),
  acc("416", "Clients douteux ou litigieux", 4, A, true, "41"),
  acc("4117", "Clients - Retenues de garantie", 4, A, true, "411"),
  acc("418", "Clients - Produits non encore facturés", 4, A, true, "41"),
  acc("419", "Clients créditeurs", 4, L, false, "41"),
  acc("4191", "Clients - Avances et acomptes reçus sur commandes", 4, L, false, "419"),
  acc("4196", "Clients - Dettes pour emballages et matériel consignés", 4, L, false, "419"),
  acc("4198", "Rabais, remises, ristournes à accorder et autres avoirs à établir", 4, L, false, "419"),

  // 42 — Personnel
  acc("42", "Personnel et comptes rattachés", 4, L, false),
  acc("421", "Personnel - Rémunérations dues", 4, L, false, "42"),
  acc("422", "Comités d'entreprise, d'établissement", 4, L, false, "42"),
  acc("424", "Participation des salariés aux résultats", 4, L, false, "42"),
  acc("425", "Personnel - Avances et acomptes", 4, A, true, "42"),
  acc("426", "Personnel - Dépôts", 4, L, false, "42"),
  acc("427", "Personnel - Oppositions", 4, L, false, "42"),
  acc("428", "Personnel - Charges à payer et produits à recevoir", 4, L, false, "42"),
  acc("4282", "Dettes provisionnées pour congés à payer", 4, L, false, "428"),
  acc("4286", "Autres charges à payer", 4, L, false, "428"),

  // 43 — Sécurité sociale
  acc("43", "Sécurité sociale et autres organismes sociaux", 4, L, false),
  acc("431", "Sécurité sociale", 4, L, false, "43"),
  acc("437", "Autres organismes sociaux", 4, L, false, "43"),
  acc("4382", "Charges sociales sur congés à payer", 4, L, false, "43"),
  acc("4386", "Organismes sociaux - Autres charges à payer", 4, L, false, "43"),
  acc("4387", "Produits à recevoir", 4, A, true, "43"),

  // 44 — État et autres collectivités publiques
  acc("44", "État et autres collectivités publiques", 4, L, false),
  acc("441", "État - Subventions à recevoir", 4, A, true, "44"),
  acc("442", "Contributions, impôts et taxes recouvrés pour le compte de l'État", 4, L, false, "44"),
  acc("4421", "Prélèvements à la source (impôt sur le revenu)", 4, L, false, "442"),
  acc("443", "Opérations particulières avec l'État", 4, A, true, "44"),
  acc("4431", "Créance sur l'État - Suppression décalage TVA", 4, A, true, "443"),
  acc("444", "État - Impôts sur les bénéfices", 4, L, false, "44"),
  acc("445", "État - Taxes sur le chiffre d'affaires", 4, L, false, "44"),
  acc("4452", "TVA due intracommunautaire", 4, L, false, "445"),
  acc("4455", "Taxes sur le chiffre d'affaires à décaisser", 4, L, false, "445"),
  acc("44551", "TVA à décaisser", 4, L, false, "4455"),
  acc("4456", "Taxes sur le chiffre d'affaires déductibles", 4, A, true, "445"),
  acc("44562", "TVA sur immobilisations", 4, A, true, "4456"),
  acc("44566", "TVA sur autres biens et services", 4, A, true, "4456"),
  acc("44567", "Crédit de TVA à reporter", 4, A, true, "4456"),
  acc("4457", "Taxes sur le chiffre d'affaires collectées par l'entreprise", 4, L, false, "445"),
  acc("44571", "TVA collectée", 4, L, false, "4457"),
  acc("4458", "Taxes sur le chiffre d'affaires à régulariser ou en attente", 4, L, false, "445"),
  acc("44581", "Acomptes - Régime simplifié d'imposition", 4, L, false, "4458"),
  acc("44583", "Remboursement de taxes sur le chiffre d'affaires demandé", 4, A, true, "4458"),
  acc("44584", "TVA récupérée d'avance", 4, L, false, "4458"),
  acc("44586", "Taxes sur le chiffre d'affaires sur factures non parvenues", 4, A, true, "4458"),
  acc("44587", "Taxes sur le chiffre d'affaires sur factures à établir", 4, L, false, "4458"),
  acc("446", "Obligations cautionnées", 4, L, false, "44"),
  acc("447", "Autres impôts, taxes et versements assimilés", 4, L, false, "44"),
  acc("4471", "Taxes assimilées à la TVA (3310-A)", 4, L, false, "447"),
  acc("4472", "Droits d'accise (3310-TIC)", 4, L, false, "447"),
  acc("448", "État - Charges à payer et produits à recevoir", 4, L, false, "44"),
  acc("4486", "État - Charges à payer", 4, L, false, "448"),
  acc("4487", "État - Produits à recevoir", 4, A, true, "448"),

  // 45 — Groupe et associés
  acc("45", "Groupe et associés", 4, A, true),
  acc("451", "Groupe", 4, A, true, "45"),
  acc("455", "Associés - Comptes courants", 4, L, false, "45"),
  acc("4551", "Principal", 4, L, false, "455"),
  acc("4558", "Intérêts courus", 4, L, false, "455"),
  acc("456", "Associés - Opérations sur le capital", 4, A, true, "45"),
  acc("4561", "Associés - Comptes d'apport en société", 4, A, true, "456"),
  acc("4562", "Apporteurs - Capital appelé non versé", 4, A, true, "456"),
  acc("4563", "Associés - Versements reçus sur augmentation de capital", 4, L, false, "456"),
  acc("4564", "Associés - Versements anticipés", 4, L, false, "456"),
  acc("4566", "Actionnaires défaillants", 4, A, true, "456"),
  acc("4567", "Associés - Capital à rembourser", 4, L, false, "456"),
  acc("457", "Associés - Dividendes à payer", 4, L, false, "45"),
  acc("458", "Associés - Opérations faites en commun et en GIE", 4, A, true, "45"),
  acc("4581", "Opérations courantes", 4, A, true, "458"),
  acc("4588", "Opérations faites en commun", 4, A, true, "458"),

  // 46 — Débiteurs divers et créditeurs divers
  acc("46", "Débiteurs divers et créditeurs divers", 4, A, true),
  acc("462", "Créances sur cessions d'immobilisations", 4, A, true, "46"),
  acc("464", "Dettes sur acquisitions de valeurs mobilières de placement", 4, L, false, "46"),
  acc("465", "Créances sur cessions de valeurs mobilières de placement", 4, A, true, "46"),
  acc("467", "Autres comptes débiteurs ou créditeurs", 4, A, true, "46"),
  acc("468", "Divers - Charges à payer et produits à recevoir", 4, L, false, "46"),
  acc("4686", "Divers - Charges à payer", 4, L, false, "468"),
  acc("4687", "Divers - Produits à recevoir", 4, A, true, "468"),

  // 47 — Comptes transitoires ou d'attente
  acc("47", "Comptes transitoires ou d'attente", 4, A, true),
  acc("471", "Comptes d'attente", 4, A, true, "47"),
  acc("472", "Comptes d'attente", 4, A, true, "47"),
  acc("476", "Différences de conversion - Actif", 4, A, true, "47"),
  acc("477", "Différences de conversion - Passif", 4, L, false, "47"),
  acc("478", "Autres comptes transitoires", 4, A, true, "47"),

  // 48 — Comptes de régularisation
  acc("48", "Comptes de régularisation", 4, A, true),
  acc("481", "Charges à répartir sur plusieurs exercices", 4, A, true, "48"),
  acc("486", "Charges constatées d'avance", 4, A, true, "48"),
  acc("487", "Produits constatés d'avance", 4, L, false, "48"),
  acc("488", "Comptes de répartition périodique des charges et des produits", 4, A, true, "48"),
  acc("4886", "Compte de répartition périodique des charges", 4, A, true, "488"),
  acc("4887", "Compte de répartition périodique des produits", 4, L, false, "488"),

  // 49 — Dépréciations des comptes de tiers
  acc("49", "Dépréciations des comptes de tiers", 4, A, false),
  acc("491", "Dépréciations des comptes de clients", 4, A, false, "49"),
  acc("495", "Dépréciations des comptes du groupe et des associés", 4, A, false, "49"),
  acc("496", "Dépréciations des comptes de débiteurs divers", 4, A, false, "49"),
];

// ============================================================================
// CLASS 5 — Comptes financiers
// ============================================================================

const CLASS_5: PcgAccountDefinition[] = [
  // 50 — Valeurs mobilières de placement
  acc("50", "Valeurs mobilières de placement", 5, A, true),
  acc("501", "Parts dans des entreprises liées", 5, A, true, "50"),
  acc("502", "Actions propres", 5, A, true, "50"),
  acc("503", "Actions", 5, A, true, "50"),
  acc("504", "Autres titres conférant un droit de propriété", 5, A, true, "50"),
  acc("505", "Obligations et bons émis par la société et rachetés par elle", 5, A, true, "50"),
  acc("506", "Obligations", 5, A, true, "50"),
  acc("507", "Bons du Trésor et bons de caisse à court terme", 5, A, true, "50"),
  acc("508", "Autres valeurs mobilières de placement et autres créances assimilées", 5, A, true, "50"),
  acc("509", "Versements restant à effectuer sur VMP non libérées", 5, L, false, "50"),

  // 51 — Banques
  acc("51", "Banques, établissements financiers et assimilés", 5, A, true),
  acc("511", "Valeurs à l'encaissement", 5, A, true, "51"),
  acc("5112", "Chèques à encaisser", 5, A, true, "511"),
  acc("5113", "Effets à l'encaissement", 5, A, true, "511"),
  acc("5114", "Effets à l'escompte", 5, A, true, "511"),
  acc("512", "Banques", 5, A, true, "51"),
  acc("5121", "Compte en euros", 5, A, true, "512"),
  acc("5124", "Compte en devises", 5, A, true, "512"),
  acc("514", "Chèques postaux", 5, A, true, "51"),
  acc("515", "Caisses du Trésor et des établissements publics", 5, A, true, "51"),
  acc("516", "Sociétés de bourse", 5, A, true, "51"),
  acc("517", "Autres organismes financiers", 5, A, true, "51"),
  acc("518", "Intérêts courus", 5, A, true, "51"),
  acc("5186", "Intérêts courus à payer", 5, L, false, "518"),
  acc("5187", "Intérêts courus à recevoir", 5, A, true, "518"),
  acc("519", "Concours bancaires courants", 5, L, false, "51"),
  acc("5191", "Crédit de mobilisation de créances commerciales (CMCC)", 5, L, false, "519"),
  acc("5193", "Mobilisation de créances nées à l'étranger", 5, L, false, "519"),
  acc("5198", "Intérêts courus sur concours bancaires courants", 5, L, false, "519"),

  // 52 — Instruments financiers
  acc("52", "Instruments financiers à terme et jetons détenus", 5, A, true),

  // 53 — Caisse
  acc("53", "Caisse", 5, A, true),
  acc("530", "Caisse", 5, A, true, "53"),
  acc("531", "Caisse siège social", 5, A, true, "53"),
  acc("532", "Caisse succursale (ou usine) A", 5, A, true, "53"),

  // 54 — Régies d'avances et accréditifs
  acc("54", "Régies d'avances et accréditifs", 5, A, true),

  // 58 — Virements internes
  acc("58", "Virements internes", 5, A, true),
  acc("580", "Virements internes", 5, A, true, "58"),

  // 59 — Dépréciations des comptes financiers
  acc("59", "Dépréciations des comptes financiers", 5, A, false),
  acc("590", "Dépréciations des valeurs mobilières de placement", 5, A, false, "59"),
  acc("591", "Dépréciations des comptes bancaires", 5, A, false, "59"),
];

// ============================================================================
// CLASS 6 — Comptes de charges
// ============================================================================

const CLASS_6: PcgAccountDefinition[] = [
  // 60 — Achats
  acc("60", "Achats (sauf 603)", 6, X, true),
  acc("601", "Achats stockés - Matières premières (et fournitures)", 6, X, true, "60"),
  acc("602", "Achats stockés - Autres approvisionnements", 6, X, true, "60"),
  acc("6021", "Matières consommables", 6, X, true, "602"),
  acc("6022", "Fournitures consommables", 6, X, true, "602"),
  acc("6026", "Emballages", 6, X, true, "602"),
  acc("603", "Variations des stocks (approvisionnements et marchandises)", 6, X, true, "60"),
  acc("6031", "Variation des stocks de matières premières (et fournitures)", 6, X, true, "603"),
  acc("6032", "Variation des stocks des autres approvisionnements", 6, X, true, "603"),
  acc("6037", "Variation des stocks de marchandises", 6, X, true, "603"),
  acc("604", "Achats d'études et prestations de services", 6, X, true, "60"),
  acc("605", "Achats de matériel, équipements et travaux", 6, X, true, "60"),
  acc("606", "Achats non stockés de matières et fournitures", 6, X, true, "60"),
  acc("6061", "Fournitures non stockables (eau, énergie)", 6, X, true, "606"),
  acc("6063", "Fournitures d'entretien et de petit équipement", 6, X, true, "606"),
  acc("6064", "Fournitures administratives", 6, X, true, "606"),
  acc("6068", "Autres matières et fournitures", 6, X, true, "606"),
  acc("607", "Achats de marchandises", 6, X, true, "60"),
  acc("608", "Frais accessoires d'achat", 6, X, true, "60"),
  acc("609", "Rabais, remises et ristournes obtenus sur achats", 6, X, false, "60"),

  // 61 — Services extérieurs
  acc("61", "Services extérieurs", 6, X, true),
  acc("611", "Sous-traitance générale", 6, X, true, "61"),
  acc("612", "Redevances de crédit-bail", 6, X, true, "61"),
  acc("6122", "Crédit-bail mobilier", 6, X, true, "612"),
  acc("6125", "Crédit-bail immobilier", 6, X, true, "612"),
  acc("613", "Locations", 6, X, true, "61"),
  acc("6132", "Locations immobilières", 6, X, true, "613"),
  acc("6135", "Locations mobilières", 6, X, true, "613"),
  acc("614", "Charges locatives et de copropriété", 6, X, true, "61"),
  acc("615", "Entretien et réparations", 6, X, true, "61"),
  acc("6152", "Entretien et réparations sur biens immobiliers", 6, X, true, "615"),
  acc("6155", "Entretien et réparations sur biens mobiliers", 6, X, true, "615"),
  acc("616", "Primes d'assurance", 6, X, true, "61"),
  acc("6161", "Multirisques", 6, X, true, "616"),
  acc("6162", "Assurance obligatoire dommage construction", 6, X, true, "616"),
  acc("6163", "Assurance transport", 6, X, true, "616"),
  acc("6164", "Risques d'exploitation", 6, X, true, "616"),
  acc("6165", "Insolvabilité clients", 6, X, true, "616"),
  acc("617", "Études et recherches", 6, X, true, "61"),
  acc("618", "Divers", 6, X, true, "61"),
  acc("6181", "Documentation générale", 6, X, true, "618"),
  acc("6183", "Documentation technique", 6, X, true, "618"),
  acc("6185", "Frais de colloques, séminaires, conférences", 6, X, true, "618"),
  acc("619", "Rabais, remises et ristournes obtenus sur services extérieurs", 6, X, false, "61"),

  // 62 — Autres services extérieurs
  acc("62", "Autres services extérieurs", 6, X, true),
  acc("621", "Personnel extérieur à l'entreprise", 6, X, true, "62"),
  acc("6211", "Personnel intérimaire", 6, X, true, "621"),
  acc("6214", "Personnel détaché ou prêté à l'entreprise", 6, X, true, "621"),
  acc("622", "Rémunérations d'intermédiaires et honoraires", 6, X, true, "62"),
  acc("6221", "Commissions et courtages sur achats", 6, X, true, "622"),
  acc("6222", "Commissions et courtages sur ventes", 6, X, true, "622"),
  acc("6224", "Rémunérations des transitaires", 6, X, true, "622"),
  acc("6225", "Rémunérations d'affacturage", 6, X, true, "622"),
  acc("6226", "Honoraires", 6, X, true, "622"),
  acc("6227", "Frais d'actes et de contentieux", 6, X, true, "622"),
  acc("6228", "Divers", 6, X, true, "622"),
  acc("623", "Publicité, publications, relations publiques", 6, X, true, "62"),
  acc("6231", "Annonces et insertions", 6, X, true, "623"),
  acc("6233", "Foires et expositions", 6, X, true, "623"),
  acc("6234", "Cadeaux à la clientèle", 6, X, true, "623"),
  acc("6235", "Primes", 6, X, true, "623"),
  acc("6236", "Catalogues et imprimés", 6, X, true, "623"),
  acc("6237", "Publications", 6, X, true, "623"),
  acc("6238", "Divers (pourboires, dons courants)", 6, X, true, "623"),
  acc("624", "Transports de biens et transports collectifs du personnel", 6, X, true, "62"),
  acc("6241", "Transports sur achats", 6, X, true, "624"),
  acc("6242", "Transports sur ventes", 6, X, true, "624"),
  acc("6243", "Transports entre établissements ou chantiers", 6, X, true, "624"),
  acc("6244", "Transports administratifs", 6, X, true, "624"),
  acc("6247", "Transports collectifs du personnel", 6, X, true, "624"),
  acc("6248", "Divers", 6, X, true, "624"),
  acc("625", "Déplacements, missions et réceptions", 6, X, true, "62"),
  acc("6251", "Voyages et déplacements", 6, X, true, "625"),
  acc("6255", "Frais de déménagement", 6, X, true, "625"),
  acc("6256", "Missions", 6, X, true, "625"),
  acc("6257", "Réceptions", 6, X, true, "625"),
  acc("626", "Frais postaux et de télécommunications", 6, X, true, "62"),
  acc("627", "Services bancaires et assimilés", 6, X, true, "62"),
  acc("6271", "Frais sur titres (achat, vente, garde)", 6, X, true, "627"),
  acc("6272", "Commissions et frais sur émission d'emprunts", 6, X, true, "627"),
  acc("6275", "Frais sur effets", 6, X, true, "627"),
  acc("6278", "Autres frais et commissions sur prestations de services", 6, X, true, "627"),
  acc("628", "Divers", 6, X, true, "62"),
  acc("6281", "Cotisations (chambres syndicales, professionnelles)", 6, X, true, "628"),
  acc("629", "Rabais, remises et ristournes obtenus sur autres services extérieurs", 6, X, false, "62"),

  // 63 — Impôts, taxes et versements assimilés
  acc("63", "Impôts, taxes et versements assimilés", 6, X, true),
  acc("631", "Impôts, taxes et versements assimilés sur rémunérations (administration des impôts)", 6, X, true, "63"),
  acc("6311", "Taxe sur les salaires", 6, X, true, "631"),
  acc("6312", "Taxe d'apprentissage", 6, X, true, "631"),
  acc("6313", "Participation des employeurs à la formation professionnelle continue", 6, X, true, "631"),
  acc("6314", "Cotisation pour défaut d'investissement obligatoire dans la construction", 6, X, true, "631"),
  acc("633", "Impôts, taxes et versements assimilés sur rémunérations (autres organismes)", 6, X, true, "63"),
  acc("6331", "Versement de transport", 6, X, true, "633"),
  acc("6332", "Allocation logement", 6, X, true, "633"),
  acc("6333", "Participation des employeurs à la formation professionnelle continue", 6, X, true, "633"),
  acc("6334", "Participation des employeurs à l'effort de construction", 6, X, true, "633"),
  acc("6335", "Versements libératoires ouvrant droit à l'exonération de la taxe d'apprentissage", 6, X, true, "633"),
  acc("635", "Autres impôts, taxes et versements assimilés (administration des impôts)", 6, X, true, "63"),
  acc("6351", "Impôts directs (sauf impôt sur les bénéfices)", 6, X, true, "635"),
  acc("63511", "Contribution économique territoriale", 6, X, true, "6351"),
  acc("63512", "Taxes foncières", 6, X, true, "6351"),
  acc("63513", "Autres impôts locaux", 6, X, true, "6351"),
  acc("63514", "Taxe sur les véhicules de sociétés", 6, X, true, "6351"),
  acc("6352", "Taxes sur le chiffre d'affaires non récupérables", 6, X, true, "635"),
  acc("6353", "Impôts indirects", 6, X, true, "635"),
  acc("6354", "Droits d'enregistrement et de timbre", 6, X, true, "635"),
  acc("6358", "Autres droits", 6, X, true, "635"),
  acc("637", "Autres impôts, taxes et versements assimilés (autres organismes)", 6, X, true, "63"),
  acc("6371", "Contribution sociale de solidarité à la charge des sociétés", 6, X, true, "637"),
  acc("6374", "Impôts et taxes exigibles à l'étranger", 6, X, true, "637"),
  acc("6378", "Taxes diverses", 6, X, true, "637"),

  // 64 — Charges de personnel
  acc("64", "Charges de personnel", 6, X, true),
  acc("641", "Rémunérations du personnel", 6, X, true, "64"),
  acc("6411", "Salaires, appointements", 6, X, true, "641"),
  acc("6412", "Congés payés", 6, X, true, "641"),
  acc("6413", "Primes et gratifications", 6, X, true, "641"),
  acc("6414", "Indemnités et avantages divers", 6, X, true, "641"),
  acc("6415", "Supplément familial", 6, X, true, "641"),
  acc("644", "Rémunération du travail de l'exploitant", 6, X, true, "64"),
  acc("645", "Charges de sécurité sociale et de prévoyance", 6, X, true, "64"),
  acc("6451", "Cotisations à l'URSSAF", 6, X, true, "645"),
  acc("6452", "Cotisations aux mutuelles", 6, X, true, "645"),
  acc("6453", "Cotisations aux caisses de retraite et de prévoyance", 6, X, true, "645"),
  acc("6454", "Cotisations aux ASSEDIC", 6, X, true, "645"),
  acc("6458", "Cotisations aux autres organismes sociaux", 6, X, true, "645"),
  acc("646", "Cotisations sociales personnelles de l'exploitant", 6, X, true, "64"),
  acc("647", "Autres charges sociales", 6, X, true, "64"),
  acc("6471", "Prestations directes", 6, X, true, "647"),
  acc("6472", "Versements aux comités d'entreprise et d'établissement", 6, X, true, "647"),
  acc("6473", "Versements aux comités d'hygiène et de sécurité", 6, X, true, "647"),
  acc("6474", "Versements aux autres œuvres sociales", 6, X, true, "647"),
  acc("6475", "Médecine du travail, pharmacie", 6, X, true, "647"),
  acc("648", "Autres charges de personnel", 6, X, true, "64"),

  // 65 — Autres charges de gestion courante
  acc("65", "Autres charges de gestion courante", 6, X, true),
  acc("651", "Redevances pour concessions, brevets, licences, marques, procédés, logiciels", 6, X, true, "65"),
  acc("653", "Jetons de présence", 6, X, true, "65"),
  acc("654", "Pertes sur créances irrécouvrables", 6, X, true, "65"),
  acc("655", "Quote-parts de résultat sur opérations faites en commun", 6, X, true, "65"),
  acc("656", "Pertes de change sur créances et dettes commerciales", 6, X, true, "65"),
  acc("658", "Charges diverses de gestion courante", 6, X, true, "65"),

  // 66 — Charges financières
  acc("66", "Charges financières", 6, X, true),
  acc("661", "Charges d'intérêts", 6, X, true, "66"),
  acc("6611", "Intérêts des emprunts et dettes", 6, X, true, "661"),
  acc("6615", "Intérêts des comptes courants et des dépôts créditeurs", 6, X, true, "661"),
  acc("6616", "Intérêts bancaires et sur opérations de financement", 6, X, true, "661"),
  acc("6617", "Intérêts des obligations cautionnées", 6, X, true, "661"),
  acc("6618", "Intérêts des autres dettes", 6, X, true, "661"),
  acc("664", "Pertes sur créances liées à des participations", 6, X, true, "66"),
  acc("665", "Escomptes accordés", 6, X, true, "66"),
  acc("666", "Pertes de change financières", 6, X, true, "66"),
  acc("667", "Charges nettes sur cessions de valeurs mobilières de placement", 6, X, true, "66"),
  acc("668", "Autres charges financières", 6, X, true, "66"),

  // 67 — Charges exceptionnelles
  acc("67", "Charges exceptionnelles", 6, X, true),
  acc("671", "Charges exceptionnelles sur opérations de gestion", 6, X, true, "67"),
  acc("6711", "Pénalités sur marchés et dédits", 6, X, true, "671"),
  acc("6712", "Pénalités, amendes fiscales et pénales", 6, X, true, "671"),
  acc("6713", "Dons, libéralités", 6, X, true, "671"),
  acc("6714", "Créances devenues irrécouvrables dans l'exercice", 6, X, true, "671"),
  acc("6715", "Subventions accordées", 6, X, true, "671"),
  acc("6717", "Rappels d'impôts (autres qu'impôts sur les bénéfices)", 6, X, true, "671"),
  acc("6718", "Autres charges exceptionnelles sur opérations de gestion", 6, X, true, "671"),
  acc("675", "Valeurs comptables des éléments d'actif cédés", 6, X, true, "67"),
  acc("678", "Autres charges exceptionnelles", 6, X, true, "67"),

  // 68 — Dotations aux amortissements, dépréciations et provisions
  acc("68", "Dotations aux amortissements, aux dépréciations et aux provisions", 6, X, true),
  acc("681", "Dotations aux amortissements, dépréciations et provisions - Charges d'exploitation", 6, X, true, "68"),
  acc("6811", "Dotations aux amortissements sur immobilisations incorporelles et corporelles", 6, X, true, "681"),
  acc("6812", "Dotations aux amortissements des charges d'exploitation à répartir", 6, X, true, "681"),
  acc("6815", "Dotations aux provisions d'exploitation", 6, X, true, "681"),
  acc("6816", "Dotations aux dépréciations des immobilisations incorporelles et corporelles", 6, X, true, "681"),
  acc("6817", "Dotations aux dépréciations des actifs circulants", 6, X, true, "681"),
  acc("686", "Dotations aux amortissements, dépréciations et provisions - Charges financières", 6, X, true, "68"),
  acc("6861", "Dotations aux amortissements des primes de remboursement des obligations", 6, X, true, "686"),
  acc("6865", "Dotations aux provisions financières", 6, X, true, "686"),
  acc("6866", "Dotations aux dépréciations des éléments financiers", 6, X, true, "686"),
  acc("687", "Dotations aux amortissements, dépréciations et provisions - Charges exceptionnelles", 6, X, true, "68"),
  acc("6871", "Dotations aux amortissements exceptionnels des immobilisations", 6, X, true, "687"),
  acc("6872", "Dotations aux provisions réglementées (immobilisations)", 6, X, true, "687"),
  acc("6873", "Dotations aux provisions réglementées (stocks)", 6, X, true, "687"),
  acc("6874", "Dotations aux autres provisions réglementées", 6, X, true, "687"),
  acc("6875", "Dotations aux provisions exceptionnelles", 6, X, true, "687"),
  acc("6876", "Dotations aux dépréciations exceptionnelles", 6, X, true, "687"),

  // 69 — Participation des salariés — Impôts sur les bénéfices
  acc("69", "Participation des salariés - Impôts sur les bénéfices et assimilés", 6, X, true),
  acc("691", "Participation des salariés aux résultats", 6, X, true, "69"),
  acc("695", "Impôts sur les bénéfices", 6, X, true, "69"),
  acc("6951", "Impôts dus en France", 6, X, true, "695"),
  acc("6952", "Contribution additionnelle à l'impôt sur les bénéfices", 6, X, true, "695"),
  acc("6954", "Impôts dus à l'étranger", 6, X, true, "695"),
  acc("696", "Suppléments d'impôt sur les sociétés liés aux distributions", 6, X, true, "69"),
  acc("698", "Intégration fiscale", 6, X, true, "69"),
  acc("6981", "Intégration fiscale - Charges", 6, X, true, "698"),
  acc("6989", "Intégration fiscale - Produits", 6, X, false, "698"),
  acc("699", "Produits - Report en arrière des déficits", 6, X, false, "69"),
];

// ============================================================================
// CLASS 7 — Comptes de produits
// ============================================================================

const CLASS_7: PcgAccountDefinition[] = [
  // 70 — Ventes
  acc("70", "Ventes de produits fabriqués, prestations de services, marchandises", 7, R, false),
  acc("701", "Ventes de produits finis", 7, R, false, "70"),
  acc("702", "Ventes de produits intermédiaires", 7, R, false, "70"),
  acc("703", "Ventes de produits résiduels", 7, R, false, "70"),
  acc("704", "Travaux", 7, R, false, "70"),
  acc("705", "Études", 7, R, false, "70"),
  acc("706", "Prestations de services", 7, R, false, "70"),
  acc("707", "Ventes de marchandises", 7, R, false, "70"),
  acc("708", "Produits des activités annexes", 7, R, false, "70"),
  acc("7081", "Produits des services exploités dans l'intérêt du personnel", 7, R, false, "708"),
  acc("7082", "Commissions et courtages", 7, R, false, "708"),
  acc("7083", "Locations diverses", 7, R, false, "708"),
  acc("7084", "Mise à disposition de personnel facturée", 7, R, false, "708"),
  acc("7085", "Ports et frais accessoires facturés", 7, R, false, "708"),
  acc("7088", "Autres produits d'activités annexes", 7, R, false, "708"),
  acc("709", "Rabais, remises et ristournes accordées par l'entreprise", 7, R, true, "70"),
  acc("7091", "sur ventes de produits finis", 7, R, true, "709"),
  acc("7092", "sur ventes de produits intermédiaires", 7, R, true, "709"),
  acc("7094", "sur travaux", 7, R, true, "709"),
  acc("7095", "sur études", 7, R, true, "709"),
  acc("7096", "sur prestations de services", 7, R, true, "709"),
  acc("7097", "sur ventes de marchandises", 7, R, true, "709"),
  acc("7098", "sur produits des activités annexes", 7, R, true, "709"),

  // 71 — Production stockée
  acc("71", "Production stockée (ou déstockage)", 7, R, false),
  acc("713", "Variation des stocks", 7, R, false, "71"),
  acc("7133", "Variation des en-cours de production de biens", 7, R, false, "713"),
  acc("7134", "Variation des en-cours de production de services", 7, R, false, "713"),
  acc("7135", "Variation des stocks de produits", 7, R, false, "713"),

  // 72 — Production immobilisée
  acc("72", "Production immobilisée", 7, R, false),
  acc("721", "Immobilisations incorporelles", 7, R, false, "72"),
  acc("722", "Immobilisations corporelles", 7, R, false, "72"),

  // 74 — Subventions d'exploitation
  acc("74", "Subventions d'exploitation", 7, R, false),
  acc("740", "Subventions d'exploitation", 7, R, false, "74"),
  acc("741", "Subventions reçues de l'État", 7, R, false, "74"),
  acc("742", "Subventions reçues des collectivités locales", 7, R, false, "74"),
  acc("748", "Autres subventions d'exploitation", 7, R, false, "74"),

  // 75 — Autres produits de gestion courante
  acc("75", "Autres produits de gestion courante", 7, R, false),
  acc("751", "Redevances pour concessions, brevets, licences, marques, procédés, logiciels", 7, R, false, "75"),
  acc("752", "Revenus des immeubles non affectés aux activités professionnelles", 7, R, false, "75"),
  acc("753", "Jetons de présence et rémunérations d'administrateurs, gérants", 7, R, false, "75"),
  acc("754", "Ristournes perçues des coopératives", 7, R, false, "75"),
  acc("755", "Quote-parts de résultat sur opérations faites en commun", 7, R, false, "75"),
  acc("756", "Gains de change sur créances et dettes commerciales", 7, R, false, "75"),
  acc("758", "Produits divers de gestion courante", 7, R, false, "75"),

  // 76 — Produits financiers
  acc("76", "Produits financiers", 7, R, false),
  acc("761", "Produits de participations", 7, R, false, "76"),
  acc("7611", "Revenus des titres de participation", 7, R, false, "761"),
  acc("7616", "Revenus sur autres formes de participation", 7, R, false, "761"),
  acc("7617", "Revenus de créances rattachées à des participations", 7, R, false, "761"),
  acc("762", "Produits des autres immobilisations financières", 7, R, false, "76"),
  acc("7621", "Revenus des titres immobilisés", 7, R, false, "762"),
  acc("7624", "Revenus des prêts", 7, R, false, "762"),
  acc("7626", "Revenus d'escomptes obtenus", 7, R, false, "762"),
  acc("7627", "Revenus des créances diverses", 7, R, false, "762"),
  acc("764", "Revenus des valeurs mobilières de placement", 7, R, false, "76"),
  acc("765", "Escomptes obtenus", 7, R, false, "76"),
  acc("766", "Gains de change financiers", 7, R, false, "76"),
  acc("767", "Produits nets sur cessions de valeurs mobilières de placement", 7, R, false, "76"),
  acc("768", "Autres produits financiers", 7, R, false, "76"),

  // 77 — Produits exceptionnels
  acc("77", "Produits exceptionnels", 7, R, false),
  acc("771", "Produits exceptionnels sur opérations de gestion", 7, R, false, "77"),
  acc("7711", "Dédits et pénalités perçus sur achats et ventes", 7, R, false, "771"),
  acc("7713", "Libéralités reçues", 7, R, false, "771"),
  acc("7714", "Rentrées sur créances amorties", 7, R, false, "771"),
  acc("7715", "Subventions d'équilibre", 7, R, false, "771"),
  acc("7717", "Dégrèvements d'impôts (autres qu'impôts sur les bénéfices)", 7, R, false, "771"),
  acc("7718", "Autres produits exceptionnels sur opérations de gestion", 7, R, false, "771"),
  acc("775", "Produits des cessions d'éléments d'actif", 7, R, false, "77"),
  acc("777", "Quote-part des subventions d'investissement virée au résultat", 7, R, false, "77"),
  acc("778", "Autres produits exceptionnels", 7, R, false, "77"),

  // 78 — Reprises sur amortissements, dépréciations et provisions
  acc("78", "Reprises sur amortissements, dépréciations et provisions", 7, R, false),
  acc("781", "Reprises sur amortissements, dépréciations et provisions (produits d'exploitation)", 7, R, false, "78"),
  acc("7811", "Reprises sur amortissements des immobilisations incorporelles et corporelles", 7, R, false, "781"),
  acc("7815", "Reprises sur provisions d'exploitation", 7, R, false, "781"),
  acc("7816", "Reprises sur dépréciations des immobilisations incorporelles et corporelles", 7, R, false, "781"),
  acc("7817", "Reprises sur dépréciations des actifs circulants", 7, R, false, "781"),
  acc("786", "Reprises sur dépréciations et provisions (produits financiers)", 7, R, false, "78"),
  acc("7861", "Reprises sur amortissements des primes de remboursement des obligations", 7, R, false, "786"),
  acc("7865", "Reprises sur provisions financières", 7, R, false, "786"),
  acc("7866", "Reprises sur dépréciations des éléments financiers", 7, R, false, "786"),
  acc("787", "Reprises sur dépréciations et provisions (produits exceptionnels)", 7, R, false, "78"),
  acc("7871", "Reprises sur amortissements exceptionnels des immobilisations", 7, R, false, "787"),
  acc("7872", "Reprises sur provisions réglementées (immobilisations)", 7, R, false, "787"),
  acc("7873", "Reprises sur provisions réglementées (stocks)", 7, R, false, "787"),
  acc("7874", "Reprises sur autres provisions réglementées", 7, R, false, "787"),
  acc("7875", "Reprises sur provisions exceptionnelles", 7, R, false, "787"),
  acc("7876", "Reprises sur dépréciations exceptionnelles", 7, R, false, "787"),

  // 79 — Transferts de charges
  acc("79", "Transferts de charges", 7, R, false),
  acc("791", "Transferts de charges d'exploitation", 7, R, false, "79"),
  acc("796", "Transferts de charges financières", 7, R, false, "79"),
  acc("797", "Transferts de charges exceptionnelles", 7, R, false, "79"),
];

// ============================================================================
// CLASS 8 — Comptes spéciaux
// ============================================================================

const CLASS_8: PcgAccountDefinition[] = [
  acc("80", "Engagements", 8, A, true),
  acc("801", "Engagements donnés par l'entité", 8, A, true, "80"),
  acc("8011", "Avals, cautions, garanties donnés", 8, A, true, "801"),
  acc("8014", "Effets circulant sous l'endos de l'entité", 8, A, true, "801"),
  acc("8016", "Redevances crédit-bail restant à courir", 8, A, true, "801"),
  acc("8018", "Autres engagements donnés", 8, A, true, "801"),
  acc("802", "Engagements reçus par l'entité", 8, A, false, "80"),
  acc("8021", "Avals, cautions, garanties reçus", 8, A, false, "802"),
  acc("8024", "Créances escomptées non échues", 8, A, false, "802"),
  acc("8026", "Engagements reçus pour utilisation en crédit-bail", 8, A, false, "802"),
  acc("8028", "Autres engagements reçus", 8, A, false, "802"),
  acc("809", "Contrepartie des engagements", 8, A, true, "80"),

  acc("88", "Résultat en instance d'affectation", 8, E, false),
  acc("89", "Bilan", 8, A, true),
  acc("890", "Bilan d'ouverture", 8, A, true, "89"),
  acc("891", "Bilan de clôture", 8, A, true, "89"),
];

// ============================================================================
// FULL PCG — All classes combined
// ============================================================================

/** Complete PCG chart of accounts — all standard accounts Classes 1-8 */
export const PCG_ACCOUNTS_FULL: readonly PcgAccountDefinition[] = [
  ...CLASS_1,
  ...CLASS_2,
  ...CLASS_3,
  ...CLASS_4,
  ...CLASS_5,
  ...CLASS_6,
  ...CLASS_7,
  ...CLASS_8,
];

// ============================================================================
// Lookup functions
// ============================================================================

// Pre-built index for O(1) lookups
const _accountsByCode = new Map<string, PcgAccountDefinition>();
for (const a of PCG_ACCOUNTS_FULL) {
  _accountsByCode.set(a.code, a);
}

/** Get account definition by code */
export function getAccountByCode(code: string): PcgAccountDefinition | undefined {
  return _accountsByCode.get(code);
}

/** Get all accounts for a given class */
export function getAccountsByClass(cls: AccountClass): readonly PcgAccountDefinition[] {
  return PCG_ACCOUNTS_FULL.filter((a) => a.class === cls);
}

/** Get all child accounts of a parent */
export function getChildAccounts(parentCode: string): readonly PcgAccountDefinition[] {
  return PCG_ACCOUNTS_FULL.filter((a) => a.parentCode === parentCode);
}

/** Get all accounts whose code starts with a prefix */
export function getAccountsByPrefix(prefix: string): readonly PcgAccountDefinition[] {
  return PCG_ACCOUNTS_FULL.filter((a) => a.code.startsWith(prefix));
}

/** Get the full hierarchy path for an account (from class down to account) */
export function getAccountHierarchy(code: string): readonly PcgAccountDefinition[] {
  const result: PcgAccountDefinition[] = [];
  let current = _accountsByCode.get(code);
  while (current) {
    result.unshift(current);
    current = current.parentCode ? _accountsByCode.get(current.parentCode) : undefined;
  }
  return result;
}

/** Check if an account code exists in the PCG */
export function isValidPcgAccount(code: string): boolean {
  return _accountsByCode.has(code);
}

/** Get all leaf accounts (accounts with no children) */
export function getLeafAccounts(): readonly PcgAccountDefinition[] {
  const parentCodes = new Set(PCG_ACCOUNTS_FULL.map((a) => a.parentCode).filter(Boolean));
  return PCG_ACCOUNTS_FULL.filter((a) => !parentCodes.has(a.code));
}

/** Get all accounts of a specific type */
export function getAccountsByType(typeId: AccountTypeCode): readonly PcgAccountDefinition[] {
  return PCG_ACCOUNTS_FULL.filter((a) => a.typeId === typeId);
}
