/**
 * Full PCG Chart of Accounts (Plan Comptable Général)
 * Règlement ANC N° 2014-03 — version consolidée au 1er janvier 2024
 *
 * Source: Livre III, Chapitre III — Plan de comptes
 * Articles 941-10 through 948-89
 *
 * Every account code and label comes directly from the regulation text.
 * Where the PCG allows "subdivisions as needed" (subdivisé en tant que de besoin),
 * only the explicitly named subdivisions are included.
 *
 * IMPORTANT: This file is compliance-critical. Changes must be verified against
 * the regulation text (docs/pcg.md, Livre III Chapitre III).
 */
// ============================================================================
// Helper to define accounts concisely
// ============================================================================
function acc(code, name, cls, typeId, isDebitNormal, parentCode = null, pcgArticle = null) {
    const level = code.length === 1
        ? "class"
        : code.length === 2
            ? "category"
            : code.length === 3
                ? "subcategory"
                : code.length <= 4
                    ? "account"
                    : "subaccount";
    return {
        code,
        name,
        class: cls,
        typeId,
        isDebitNormal,
        parentCode,
        level,
        balanceSide: isDebitNormal ? "debit" : "credit",
        pcgArticle,
    };
}
// Shorthands for account types
const A = "ASSET"; // Actif
const L = "LIABILITY"; // Passif (dette)
const E = "EQUITY"; // Capitaux propres
const R = "REVENUE"; // Produit
const X = "EXPENSE"; // Charge
// ============================================================================
// CLASS 1 — Comptes de capitaux
// Art. 941-10 through 941-18
//
// PCG: "Les comptes de la classe 1 regroupent les capitaux propres
// (comptes 10 à 14), les autres fonds propres (compte 15 à 18)."
// Normal balance: CREDIT (capitaux propres = credit,
//   except 109 Actionnaires capital souscrit non appelé = debit,
//   119 Report à nouveau débiteur = debit,
//   129 Résultat perte = debit,
//   139 Subventions virées au résultat = debit,
//   169 Primes de remboursement = debit)
// ============================================================================
const CLASS_1 = [
    // === 10 — Capital et réserves (Art. 941-10) ===
    acc("10", "Capital et réserves", 1, E, false, null, "941-10"),
    acc("101", "Capital social / Capital individuel", 1, E, false, "10", "941-10"),
    acc("1011", "Capital souscrit - non appelé", 1, E, false, "101", "941-10"),
    acc("1012", "Capital souscrit - appelé, non versé", 1, E, false, "101", "941-10"),
    acc("1013", "Capital souscrit - appelé, versé", 1, E, false, "101", "941-10"),
    acc("1018", "Capital souscrit soumis à des réglementations particulières", 1, E, false, "101", "941-10"),
    acc("104", "Primes liées au capital social", 1, E, false, "10", "941-10"),
    acc("1041", "Primes d'émission", 1, E, false, "104", "941-10"),
    acc("1042", "Primes de fusion", 1, E, false, "104", "941-10"),
    acc("1043", "Primes d'apport", 1, E, false, "104", "941-10"),
    acc("1044", "Primes de conversion d'obligations en actions", 1, E, false, "104", "941-10"),
    acc("105", "Écarts de réévaluation", 1, E, false, "10", "941-10"),
    acc("106", "Réserves", 1, E, false, "10", "941-10"),
    acc("1061", "Réserve légale", 1, E, false, "106", "941-10"),
    acc("1062", "Réserves indisponibles", 1, E, false, "106", "941-10"),
    acc("1063", "Réserves statutaires ou contractuelles", 1, E, false, "106", "941-10"),
    acc("1064", "Réserves réglementées", 1, E, false, "106", "941-10"),
    acc("1068", "Autres réserves", 1, E, false, "106", "941-10"),
    acc("107", "Écart d'équivalence", 1, E, false, "10", "941-10"),
    acc("108", "Compte de l'exploitant", 1, E, false, "10", "941-10"),
    // 109: contra-equity, debit normal
    acc("109", "Actionnaires : capital souscrit - non appelé", 1, A, true, "10", "941-10"),
    // === 11 — Report à nouveau (Art. 941-11) ===
    acc("11", "Report à nouveau", 1, E, false, null, "941-11"),
    acc("110", "Report à nouveau (solde créditeur)", 1, E, false, "11", "941-11"),
    acc("119", "Report à nouveau (solde débiteur)", 1, E, true, "11", "941-11"),
    // === 12 — Résultat de l'exercice (Art. 941-12) ===
    acc("12", "Résultat de l'exercice", 1, E, false, null, "941-12"),
    acc("120", "Résultat de l'exercice (bénéfice)", 1, E, false, "12", "941-12"),
    acc("129", "Résultat de l'exercice (perte)", 1, E, true, "12", "941-12"),
    // === 13 — Subventions d'investissement (Art. 941-13) ===
    acc("13", "Subventions d'investissement", 1, E, false, null, "941-13"),
    acc("131", "Subventions d'équipement", 1, E, false, "13", "941-13"),
    acc("138", "Autres subventions d'investissement", 1, E, false, "13", "941-13"),
    // 139: contra-equity, debit normal — virée au résultat
    acc("139", "Subventions d'investissement inscrites au compte de résultat", 1, E, true, "13", "941-13"),
    // === 14 — Provisions réglementées (Art. 941-14) ===
    acc("14", "Provisions réglementées", 1, E, false, null, "941-14"),
    acc("142", "Provisions réglementées relatives aux immobilisations", 1, E, false, "14", "941-14"),
    acc("143", "Provisions réglementées relatives aux stocks", 1, E, false, "14", "941-14"),
    acc("144", "Provisions réglementées relatives aux autres éléments d'actif", 1, E, false, "14", "941-14"),
    acc("145", "Amortissements dérogatoires", 1, E, false, "14", "941-14"),
    acc("146", "Provision spéciale de réévaluation", 1, E, false, "14", "941-14"),
    acc("147", "Plus-values réinvesties", 1, E, false, "14", "941-14"),
    acc("148", "Autres provisions réglementées", 1, E, false, "14", "941-14"),
    // === 15 — Provisions (Art. 941-15) ===
    acc("15", "Provisions", 1, L, false, null, "941-15"),
    acc("151", "Provisions pour risques", 1, L, false, "15", "941-15"),
    acc("153", "Provisions pour pensions et obligations similaires", 1, L, false, "15", "941-15"),
    acc("154", "Provisions pour restructurations", 1, L, false, "15", "941-15"),
    acc("155", "Provisions pour impôts", 1, L, false, "15", "941-15"),
    acc("156", "Provisions pour renouvellement des immobilisations (entreprises concessionnaires)", 1, L, false, "15", "941-15"),
    acc("157", "Provisions pour charges à répartir sur plusieurs exercices", 1, L, false, "15", "941-15"),
    acc("158", "Autres provisions pour charges", 1, L, false, "15", "941-15"),
    // === 16 — Emprunts et dettes assimilées (Art. 941-16) ===
    acc("16", "Emprunts et dettes assimilées", 1, L, false, null, "941-16"),
    acc("161", "Emprunts obligataires convertibles", 1, L, false, "16", "941-16"),
    acc("163", "Autres emprunts obligataires", 1, L, false, "16", "941-16"),
    acc("164", "Emprunts auprès des établissements de crédit", 1, L, false, "16", "941-16"),
    acc("165", "Dépôts et cautionnements reçus", 1, L, false, "16", "941-16"),
    acc("166", "Participation des salariés aux résultats", 1, L, false, "16", "941-16"),
    acc("167", "Emprunts et dettes assortis de conditions particulières", 1, L, false, "16", "941-16"),
    acc("1671", "Émissions de titres participatifs", 1, L, false, "167", "941-16"),
    acc("1674", "Avances conditionnées de l'État", 1, L, false, "167", "941-16"),
    acc("1675", "Emprunts participatifs", 1, L, false, "167", "941-16"),
    acc("168", "Autres emprunts et dettes assimilées", 1, L, false, "16", "941-16"),
    acc("1681", "Autres emprunts", 1, L, false, "168", "941-16"),
    acc("1685", "Rentes viagères capitalisées", 1, L, false, "168", "941-16"),
    acc("1688", "Intérêts courus", 1, L, false, "168", "941-16"),
    // 169: contra-liability, debit normal
    acc("169", "Primes de remboursement des obligations", 1, A, true, "16", "941-16"),
    // === 17 — Dettes rattachées à des participations (Art. 941-17) ===
    acc("17", "Dettes rattachées à des participations", 1, L, false, null, "941-17"),
    acc("171", "Dettes rattachées à des participations (groupe)", 1, L, false, "17", "941-17"),
    acc("174", "Dettes rattachées à des participations (hors groupe)", 1, L, false, "17", "941-17"),
    acc("178", "Dettes rattachées à des sociétés en participation", 1, L, false, "17", "941-17"),
    // === 18 — Comptes de liaison (Art. 941-18) ===
    acc("18", "Comptes de liaison des établissements et sociétés en participation", 1, E, false, null, "941-18"),
    acc("181", "Comptes de liaison des établissements", 1, E, false, "18", "941-18"),
    acc("186", "Biens et prestations de services échangés entre établissements (charges)", 1, X, true, "18", "941-18"),
    acc("187", "Biens et prestations de services échangés entre établissements (produits)", 1, R, false, "18", "941-18"),
    acc("188", "Comptes de liaison des sociétés en participation", 1, E, false, "18", "941-18"),
];
// ============================================================================
// CLASS 2 — Comptes d'immobilisations
// Art. 942 through 942-29
//
// PCG Art. 942: "Les comptes d'immobilisations sont débités, à la date
// d'entrée des biens dans le patrimoine de l'entité..."
// Normal balance: DEBIT (actif)
// Exceptions: 28 Amortissements, 29 Dépréciations = credit normal (contra-asset)
//             229 Droits du concédant = credit
//             269, 279 Versements restant à effectuer = credit
// ============================================================================
const CLASS_2 = [
    // === 20 — Immobilisations incorporelles (Art. 942-20) ===
    acc("20", "Immobilisations incorporelles", 2, A, true, null, "942-20"),
    acc("201", "Frais d'établissement", 2, A, true, "20", "942-20"),
    acc("203", "Frais de recherche et de développement", 2, A, true, "20", "942-20"),
    acc("205", "Concessions et droits similaires, brevets, licences, marques, procédés, logiciels, droits et valeurs similaires", 2, A, true, "20", "942-20"),
    acc("206", "Droit au bail", 2, A, true, "20", "942-20"),
    acc("207", "Fonds commercial", 2, A, true, "20", "942-20"),
    acc("208", "Autres immobilisations incorporelles", 2, A, true, "20", "942-20"),
    // === 21 — Immobilisations corporelles (Art. 942-21) ===
    acc("21", "Immobilisations corporelles", 2, A, true, null, "942-21"),
    acc("211", "Terrains", 2, A, true, "21", "942-21"),
    acc("2111", "Terrains nus", 2, A, true, "211", "942-21"),
    acc("2112", "Terrains aménagés", 2, A, true, "211", "942-21"),
    acc("2113", "Sous-sols et sur-sols", 2, A, true, "211", "942-21"),
    acc("2114", "Terrains de gisement", 2, A, true, "211", "942-21"),
    acc("2115", "Terrains bâtis", 2, A, true, "211", "942-21"),
    acc("212", "Agencements et aménagements de terrains", 2, A, true, "21", "942-21"),
    acc("213", "Constructions", 2, A, true, "21", "942-21"),
    acc("2131", "Bâtiments", 2, A, true, "213", "942-21"),
    acc("2135", "Installations générales, agencements, aménagements des constructions", 2, A, true, "213", "942-21"),
    acc("214", "Constructions sur sol d'autrui", 2, A, true, "21", "942-21"),
    acc("215", "Installations techniques, matériel et outillage industriels", 2, A, true, "21", "942-21"),
    acc("2151", "Installations complexes spécialisées", 2, A, true, "215", "942-21"),
    acc("2154", "Matériel industriel", 2, A, true, "215", "942-21"),
    acc("2155", "Outillage industriel", 2, A, true, "215", "942-21"),
    acc("218", "Autres immobilisations corporelles", 2, A, true, "21", "942-21"),
    acc("2181", "Installations générales, agencements, aménagements divers", 2, A, true, "218", "942-21"),
    acc("2182", "Matériel de transport", 2, A, true, "218", "942-21"),
    acc("2183", "Matériel de bureau et matériel informatique", 2, A, true, "218", "942-21"),
    acc("2184", "Mobilier", 2, A, true, "218", "942-21"),
    acc("2185", "Cheptel", 2, A, true, "218", "942-21"),
    acc("2186", "Emballages récupérables", 2, A, true, "218", "942-21"),
    // === 22 — Immobilisations mises en concession (Art. 942-22) ===
    acc("22", "Immobilisations mises en concession", 2, A, true, null, "942-22"),
    acc("229", "Droits du concédant", 2, L, false, "22", "942-22"),
    // === 23 — Immobilisations en cours (Art. 942-23) ===
    acc("23", "Immobilisations en cours", 2, A, true, null, "942-23"),
    acc("231", "Immobilisations corporelles en cours", 2, A, true, "23", "942-23"),
    acc("232", "Immobilisations incorporelles en cours", 2, A, true, "23", "942-23"),
    acc("237", "Avances et acomptes versés sur immobilisations incorporelles", 2, A, true, "23", "942-23"),
    acc("238", "Avances et acomptes versés sur commandes d'immobilisations corporelles", 2, A, true, "23", "942-23"),
    // === 25 — Parts dans des entreprises liées (Art. 942-25) ===
    acc("25", "Parts dans des entreprises liées et créances sur des entreprises liées", 2, A, true, null, "942-25"),
    // === 26 — Participations (Art. 942-26) ===
    acc("26", "Participations et créances rattachées à des participations", 2, A, true, null, "942-26"),
    acc("261", "Titres de participation", 2, A, true, "26", "942-26"),
    acc("266", "Autres formes de participation", 2, A, true, "26", "942-26"),
    acc("267", "Créances rattachées à des participations", 2, A, true, "26", "942-26"),
    acc("268", "Créances rattachées à des sociétés en participation", 2, A, true, "26", "942-26"),
    // 269: contra-asset, credit normal
    acc("269", "Versements restant à effectuer sur titres de participation non libérés", 2, L, false, "26", "942-26"),
    // === 27 — Autres immobilisations financières (Art. 942-27) ===
    acc("27", "Autres immobilisations financières", 2, A, true, null, "942-27"),
    acc("271", "Titres immobilisés autres que les titres immobilisés de l'activité de portefeuille (droit de propriété)", 2, A, true, "27", "942-27"),
    acc("272", "Titres immobilisés (droit de créance)", 2, A, true, "27", "942-27"),
    acc("273", "Titres immobilisés de l'activité de portefeuille", 2, A, true, "27", "942-27"),
    acc("274", "Prêts", 2, A, true, "27", "942-27"),
    acc("2741", "Prêts participatifs", 2, A, true, "274", "942-27"),
    acc("2742", "Prêts aux associés", 2, A, true, "274", "942-27"),
    acc("2743", "Prêts au personnel", 2, A, true, "274", "942-27"),
    acc("275", "Dépôts et cautionnements versés", 2, A, true, "27", "942-27"),
    acc("2751", "Dépôts", 2, A, true, "275", "942-27"),
    acc("2755", "Cautionnements", 2, A, true, "275", "942-27"),
    acc("276", "Autres créances immobilisées", 2, A, true, "27", "942-27"),
    acc("277", "Actions propres ou parts propres", 2, A, true, "27", "942-27"),
    acc("2771", "Actions propres ou parts propres", 2, A, true, "277", "942-27"),
    acc("2772", "Actions propres ou parts propres en voie d'annulation", 2, A, true, "277", "942-27"),
    // 279: contra-asset, credit normal
    acc("279", "Versements restant à effectuer sur titres immobilisés non libérés", 2, L, false, "27", "942-27"),
    // === 28 — Amortissements des immobilisations (Art. 942-28) ===
    // Contra-asset: credit normal
    acc("28", "Amortissements des immobilisations", 2, A, false, null, "942-28"),
    acc("280", "Amortissements des immobilisations incorporelles", 2, A, false, "28", "942-28"),
    acc("2801", "Amortissements des frais d'établissement", 2, A, false, "280", "942-28"),
    acc("2803", "Amortissements des frais de recherche et de développement", 2, A, false, "280", "942-28"),
    acc("2805", "Amortissements des concessions et droits similaires, brevets, licences, logiciels", 2, A, false, "280", "942-28"),
    acc("2807", "Amortissements du fonds commercial", 2, A, false, "280", "942-28"),
    acc("2808", "Amortissements des autres immobilisations incorporelles", 2, A, false, "280", "942-28"),
    acc("281", "Amortissements des immobilisations corporelles", 2, A, false, "28", "942-28"),
    acc("2811", "Amortissements des terrains de gisement", 2, A, false, "281", "942-28"),
    acc("2812", "Amortissements des agencements et aménagements de terrains", 2, A, false, "281", "942-28"),
    acc("2813", "Amortissements des constructions", 2, A, false, "281", "942-28"),
    acc("2814", "Amortissements des constructions sur sol d'autrui", 2, A, false, "281", "942-28"),
    acc("2815", "Amortissements des installations techniques, matériel et outillage", 2, A, false, "281", "942-28"),
    acc("2818", "Amortissements des autres immobilisations corporelles", 2, A, false, "281", "942-28"),
    acc("282", "Amortissements des immobilisations mises en concession", 2, A, false, "28", "942-28"),
    // === 29 — Dépréciations des immobilisations (Art. 942-29) ===
    // Contra-asset: credit normal
    acc("29", "Dépréciations des immobilisations", 2, A, false, null, "942-29"),
    acc("290", "Dépréciations des immobilisations incorporelles", 2, A, false, "29", "942-29"),
    acc("291", "Dépréciations des immobilisations corporelles", 2, A, false, "29", "942-29"),
    acc("292", "Dépréciations des immobilisations mises en concession", 2, A, false, "29", "942-29"),
    acc("293", "Dépréciations des immobilisations en cours", 2, A, false, "29", "942-29"),
    acc("296", "Dépréciations des participations et créances rattachées à des participations", 2, A, false, "29", "942-29"),
    acc("297", "Dépréciations des autres immobilisations financières", 2, A, false, "29", "942-29"),
];
// ============================================================================
// CLASS 3 — Comptes de stocks et en-cours
// Art. 943
//
// PCG Art. 943: Nomenclature propre à l'entité, à établir en se référant
// à la nomenclature des activités françaises.
// Normal balance: DEBIT (actif)
// Exception: 39 Dépréciations = credit normal (contra-asset)
// ============================================================================
const CLASS_3 = [
    acc("31", "Matières premières (et fournitures)", 3, A, true, null, "943"),
    acc("311", "Matières premières", 3, A, true, "31", "943"),
    acc("312", "Fournitures", 3, A, true, "31", "943"),
    acc("32", "Autres approvisionnements", 3, A, true, null, "943"),
    acc("321", "Matières consommables", 3, A, true, "32", "943"),
    acc("322", "Fournitures consommables", 3, A, true, "32", "943"),
    acc("326", "Emballages", 3, A, true, "32", "943"),
    acc("33", "En-cours de production de biens", 3, A, true, null, "943"),
    acc("331", "Produits en cours", 3, A, true, "33", "943"),
    acc("335", "Travaux en cours", 3, A, true, "33", "943"),
    acc("34", "En-cours de production de services", 3, A, true, null, "943"),
    acc("341", "Études en cours", 3, A, true, "34", "943"),
    acc("345", "Prestations de services en cours", 3, A, true, "34", "943"),
    acc("35", "Stocks de produits", 3, A, true, null, "943"),
    acc("351", "Produits intermédiaires", 3, A, true, "35", "943"),
    acc("355", "Produits finis", 3, A, true, "35", "943"),
    acc("358", "Produits résiduels", 3, A, true, "35", "943"),
    acc("36", "Stocks provenant d'immobilisations", 3, A, true, null, "943"),
    acc("37", "Stocks de marchandises", 3, A, true, null, "943"),
    acc("38", "Stocks en voie d'acheminement, mis en dépôt ou donnés en consignation", 3, A, true, null, "943"),
    // 39 — Dépréciations (contra-asset, credit normal)
    acc("39", "Dépréciations des stocks et en-cours", 3, A, false, null, "943-39"),
    acc("391", "Dépréciations des matières premières", 3, A, false, "39", "943-39"),
    acc("392", "Dépréciations des autres approvisionnements", 3, A, false, "39", "943-39"),
    acc("393", "Dépréciations des en-cours de production de biens", 3, A, false, "39", "943-39"),
    acc("394", "Dépréciations des en-cours de production de services", 3, A, false, "39", "943-39"),
    acc("395", "Dépréciations des stocks de produits", 3, A, false, "39", "943-39"),
    acc("397", "Dépréciations des stocks de marchandises", 3, A, false, "39", "943-39"),
];
// ============================================================================
// CLASS 4 — Comptes de tiers
// Art. 944
//
// Normal balance: Mixed — depends on account nature.
// 40x (fournisseurs): credit normal (dette)
// 41x (clients): debit normal (créance)
// 42x (personnel): credit normal (dette salariale)
// 43x (sécu): credit normal (dette sociale)
// 44x (État): mixed
// 45x (groupe): mixed
// 46x (débiteurs/créditeurs divers): mixed
// 47x (transitoires): mixed
// 48x (régularisation): mixed
// 49x (dépréciations): credit normal (contra-asset)
// ============================================================================
const CLASS_4 = [
    // === 40 — Fournisseurs (Art. 944-40) ===
    acc("40", "Fournisseurs et comptes rattachés", 4, L, false, null, "944-40"),
    acc("401", "Fournisseurs", 4, L, false, "40", "944-40"),
    acc("403", "Fournisseurs - Effets à payer", 4, L, false, "40", "944-40"),
    acc("404", "Fournisseurs d'immobilisations", 4, L, false, "40", "944-40"),
    acc("405", "Fournisseurs d'immobilisations - Effets à payer", 4, L, false, "40", "944-40"),
    acc("408", "Fournisseurs - Factures non parvenues", 4, L, false, "40", "944-40"),
    acc("409", "Fournisseurs débiteurs", 4, A, true, "40", "944-40"),
    acc("4091", "Fournisseurs - Avances et acomptes versés sur commandes", 4, A, true, "409", "944-40"),
    acc("4096", "Fournisseurs - Créances pour emballages et matériel à rendre", 4, A, true, "409", "944-40"),
    acc("4097", "Fournisseurs - Autres avoirs", 4, A, true, "409", "944-40"),
    acc("4098", "Rabais, remises, ristournes à obtenir et autres avoirs non encore reçus", 4, A, true, "409", "944-40"),
    // === 41 — Clients (Art. 944-41) ===
    acc("41", "Clients et comptes rattachés", 4, A, true, null, "944-41"),
    acc("411", "Clients", 4, A, true, "41", "944-41"),
    acc("413", "Clients - Effets à recevoir", 4, A, true, "41", "944-41"),
    acc("416", "Clients douteux ou litigieux", 4, A, true, "41", "944-41"),
    acc("4117", "Clients - Retenues de garantie", 4, A, true, "411", "944-41"),
    acc("418", "Clients - Produits non encore facturés", 4, A, true, "41", "944-41"),
    acc("419", "Clients créditeurs", 4, L, false, "41", "944-41"),
    acc("4191", "Clients - Avances et acomptes reçus sur commandes", 4, L, false, "419", "944-41"),
    acc("4196", "Clients - Dettes pour emballages et matériel consignés", 4, L, false, "419", "944-41"),
    acc("4198", "Rabais, remises, ristournes à accorder et autres avoirs à établir", 4, L, false, "419", "944-41"),
    // === 42 — Personnel (Art. 944-42) ===
    acc("42", "Personnel et comptes rattachés", 4, L, false, null, "944-42"),
    acc("421", "Personnel - Rémunérations dues", 4, L, false, "42", "944-42"),
    acc("422", "Comités d'entreprise, d'établissement", 4, L, false, "42", "944-42"),
    acc("424", "Participation des salariés aux résultats", 4, L, false, "42", "944-42"),
    acc("425", "Personnel - Avances et acomptes", 4, A, true, "42", "944-42"),
    acc("426", "Personnel - Dépôts", 4, L, false, "42", "944-42"),
    acc("427", "Personnel - Oppositions", 4, L, false, "42", "944-42"),
    acc("428", "Personnel - Charges à payer et produits à recevoir", 4, L, false, "42", "944-42"),
    acc("4282", "Dettes provisionnées pour congés à payer", 4, L, false, "428", "944-42"),
    acc("4284", "Dettes provisionnées pour participation des salariés aux résultats", 4, L, false, "428", "944-42"),
    acc("4286", "Autres charges à payer", 4, L, false, "428", "944-42"),
    // === 43 — Sécurité sociale (Art. 944-43) ===
    acc("43", "Sécurité sociale et autres organismes sociaux", 4, L, false, null, "944-43"),
    acc("431", "Sécurité sociale", 4, L, false, "43", "944-43"),
    acc("437", "Autres organismes sociaux", 4, L, false, "43", "944-43"),
    acc("4382", "Charges sociales sur congés à payer", 4, L, false, "43", "944-43"),
    acc("4386", "Organismes sociaux - Autres charges à payer", 4, L, false, "43", "944-43"),
    acc("4387", "Organismes sociaux - Produits à recevoir", 4, A, true, "43", "944-43"),
    // === 44 — État (Art. 944-44) ===
    acc("44", "État et autres collectivités publiques", 4, L, false, null, "944-44"),
    acc("441", "État - Subventions à recevoir", 4, A, true, "44", "944-44"),
    acc("442", "Contributions, impôts et taxes recouvrés pour le compte de l'État", 4, L, false, "44", "944-44"),
    acc("4421", "Prélèvements à la source (impôt sur le revenu)", 4, L, false, "442", "944-44"),
    acc("443", "Opérations particulières avec l'État", 4, A, true, "44", "944-44"),
    acc("4431", "Créances sur l'État résultant de la suppression de la règle du décalage d'un mois en matière de TVA", 4, A, true, "443", "944-44"),
    acc("4438", "Intérêts courus sur créances figurant au 4431", 4, A, true, "443", "944-44"),
    acc("444", "État - Impôts sur les bénéfices", 4, L, false, "44", "944-44"),
    acc("445", "État - Taxes sur le chiffre d'affaires", 4, L, false, "44", "944-44"),
    acc("4452", "TVA due intracommunautaire", 4, L, false, "445", "944-44"),
    acc("4455", "Taxes sur le chiffre d'affaires à décaisser", 4, L, false, "445", "944-44"),
    acc("44551", "TVA à décaisser", 4, L, false, "4455", "944-44"),
    acc("4456", "Taxes sur le chiffre d'affaires déductibles", 4, A, true, "445", "944-44"),
    acc("44562", "TVA sur immobilisations", 4, A, true, "4456", "944-44"),
    acc("44566", "TVA sur autres biens et services", 4, A, true, "4456", "944-44"),
    acc("44567", "Crédit de TVA à reporter", 4, A, true, "4456", "944-44"),
    acc("44568", "Taxes assimilées à la TVA", 4, A, true, "4456", "944-44"),
    acc("4457", "Taxes sur le chiffre d'affaires collectées par l'entreprise", 4, L, false, "445", "944-44"),
    acc("44571", "TVA collectée", 4, L, false, "4457", "944-44"),
    acc("4458", "Taxes sur le chiffre d'affaires à régulariser ou en attente", 4, L, false, "445", "944-44"),
    acc("44581", "Acomptes - Régime simplifié d'imposition", 4, L, false, "4458", "944-44"),
    acc("44583", "Remboursement de taxes sur le chiffre d'affaires demandé", 4, A, true, "4458", "944-44"),
    acc("44584", "TVA récupérée d'avance", 4, L, false, "4458", "944-44"),
    acc("44586", "Taxes sur le chiffre d'affaires sur factures non parvenues", 4, A, true, "4458", "944-44"),
    acc("44587", "Taxes sur le chiffre d'affaires sur factures à établir", 4, L, false, "4458", "944-44"),
    acc("446", "Obligations cautionnées", 4, L, false, "44", "944-44"),
    acc("447", "Autres impôts, taxes et versements assimilés", 4, L, false, "44", "944-44"),
    acc("448", "État - Charges à payer et produits à recevoir", 4, L, false, "44", "944-44"),
    acc("4486", "État - Charges à payer", 4, L, false, "448", "944-44"),
    acc("4487", "État - Produits à recevoir", 4, A, true, "448", "944-44"),
    // === 45 — Groupe et associés (Art. 944-45) ===
    acc("45", "Groupe et associés", 4, A, true, null, "944-45"),
    acc("451", "Groupe", 4, A, true, "45", "944-45"),
    acc("455", "Associés - Comptes courants", 4, L, false, "45", "944-45"),
    acc("4551", "Principal", 4, L, false, "455", "944-45"),
    acc("4558", "Intérêts courus", 4, L, false, "455", "944-45"),
    acc("456", "Associés - Opérations sur le capital", 4, A, true, "45", "944-45"),
    acc("4561", "Associés - Comptes d'apport en société", 4, A, true, "456", "944-45"),
    acc("4562", "Apporteurs - Capital appelé, non versé", 4, A, true, "456", "944-45"),
    acc("4563", "Associés - Versements reçus sur augmentation de capital", 4, L, false, "456", "944-45"),
    acc("4564", "Associés - Versements anticipés", 4, L, false, "456", "944-45"),
    acc("4566", "Actionnaires défaillants", 4, A, true, "456", "944-45"),
    acc("4567", "Associés - Capital à rembourser", 4, L, false, "456", "944-45"),
    acc("457", "Associés - Dividendes à payer", 4, L, false, "45", "944-45"),
    acc("458", "Associés - Opérations faites en commun et en GIE", 4, A, true, "45", "944-45"),
    acc("4581", "Opérations courantes", 4, A, true, "458", "944-45"),
    acc("4588", "Opérations faites en commun", 4, A, true, "458", "944-45"),
    // === 46 — Débiteurs divers et créditeurs divers (Art. 944-46) ===
    acc("46", "Débiteurs divers et créditeurs divers", 4, A, true, null, "944-46"),
    acc("462", "Créances sur cessions d'immobilisations", 4, A, true, "46", "944-46"),
    acc("464", "Dettes sur acquisitions de valeurs mobilières de placement", 4, L, false, "46", "944-46"),
    acc("465", "Créances sur cessions de valeurs mobilières de placement", 4, A, true, "46", "944-46"),
    acc("467", "Autres comptes débiteurs ou créditeurs", 4, A, true, "46", "944-46"),
    acc("468", "Divers - Charges à payer et produits à recevoir", 4, L, false, "46", "944-46"),
    acc("4686", "Divers - Charges à payer", 4, L, false, "468", "944-46"),
    acc("4687", "Divers - Produits à recevoir", 4, A, true, "468", "944-46"),
    // === 47 — Comptes transitoires ou d'attente (Art. 944-47) ===
    acc("47", "Comptes transitoires ou d'attente", 4, A, true, null, "944-47"),
    acc("471", "Comptes d'attente", 4, A, true, "47", "944-47"),
    acc("472", "Comptes d'attente", 4, A, true, "47", "944-47"),
    acc("476", "Différences de conversion - Actif", 4, A, true, "47", "944-47"),
    acc("477", "Différences de conversion - Passif", 4, L, false, "47", "944-47"),
    // TODO: 4746/4747 for jetons (Art. 944-47, 2024 amendment) — omitted for now as niche
    acc("478", "Autres comptes transitoires", 4, A, true, "47", "944-47"),
    // === 48 — Comptes de régularisation (Art. 944-48) ===
    acc("48", "Comptes de régularisation", 4, A, true, null, "944-48"),
    acc("481", "Charges à répartir sur plusieurs exercices", 4, A, true, "48", "944-48"),
    acc("486", "Charges constatées d'avance", 4, A, true, "48", "944-48"),
    acc("487", "Produits constatés d'avance", 4, L, false, "48", "944-48"),
    acc("4871", "Produits constatés d'avance sur jetons émis", 4, L, false, "487", "944-48"),
    acc("488", "Comptes de répartition périodique des charges et des produits", 4, A, true, "48", "944-48"),
    acc("4886", "Compte de répartition périodique des charges", 4, A, true, "488", "944-48"),
    acc("4887", "Compte de répartition périodique des produits", 4, L, false, "488", "944-48"),
    // === 49 — Dépréciations (Art. 944-49) ===
    // Contra-asset: credit normal
    acc("49", "Dépréciations des comptes de tiers", 4, A, false, null, "944-49"),
    acc("491", "Dépréciations des comptes de clients", 4, A, false, "49", "944-49"),
    acc("495", "Dépréciations des comptes du groupe et des associés", 4, A, false, "49", "944-49"),
    acc("496", "Dépréciations des comptes de débiteurs divers", 4, A, false, "49", "944-49"),
];
// ============================================================================
// CLASS 5 — Comptes financiers
// Art. 945-50 through 945-59
//
// Normal balance: DEBIT (actif)
// Exceptions: 509 Versements restant à effectuer = credit
//             519 Concours bancaires courants = credit (dette)
//             5186 Intérêts courus à payer = credit
//             59 Dépréciations = credit (contra-asset)
// ============================================================================
const CLASS_5 = [
    // === 50 — VMP (Art. 945-50) ===
    acc("50", "Valeurs mobilières de placement", 5, A, true, null, "945-50"),
    acc("501", "Parts dans des entreprises liées", 5, A, true, "50", "945-50"),
    acc("502", "Actions propres", 5, A, true, "50", "945-50"),
    acc("503", "Actions", 5, A, true, "50", "945-50"),
    acc("504", "Autres titres conférant un droit de propriété", 5, A, true, "50", "945-50"),
    acc("505", "Obligations et bons émis par la société et rachetés par elle", 5, A, true, "50", "945-50"),
    acc("506", "Obligations", 5, A, true, "50", "945-50"),
    acc("507", "Bons du Trésor et bons de caisse à court terme", 5, A, true, "50", "945-50"),
    acc("508", "Autres valeurs mobilières de placement et autres créances assimilées", 5, A, true, "50", "945-50"),
    acc("509", "Versements restant à effectuer sur valeurs mobilières de placement non libérées", 5, L, false, "50", "945-50"),
    // === 51 — Banques (Art. 945-51) ===
    acc("51", "Banques, établissements financiers et assimilés", 5, A, true, null, "945-51"),
    acc("511", "Valeurs à l'encaissement", 5, A, true, "51", "945-51"),
    acc("5112", "Chèques à encaisser", 5, A, true, "511", "945-51"),
    acc("5113", "Effets à l'encaissement", 5, A, true, "511", "945-51"),
    acc("5114", "Effets à l'escompte", 5, A, true, "511", "945-51"),
    acc("512", "Banques", 5, A, true, "51", "945-51"),
    acc("5121", "Compte en euros", 5, A, true, "512", "945-51"),
    acc("5124", "Compte en devises", 5, A, true, "512", "945-51"),
    acc("514", "Chèques postaux", 5, A, true, "51", "945-51"),
    acc("515", "Caisses du Trésor et des établissements publics", 5, A, true, "51", "945-51"),
    acc("516", "Sociétés de bourse", 5, A, true, "51", "945-51"),
    acc("517", "Autres organismes financiers", 5, A, true, "51", "945-51"),
    acc("518", "Intérêts courus", 5, A, true, "51", "945-51"),
    acc("5186", "Intérêts courus à payer", 5, L, false, "518", "945-51"),
    acc("5187", "Intérêts courus à recevoir", 5, A, true, "518", "945-51"),
    acc("519", "Concours bancaires courants", 5, L, false, "51", "945-51"),
    acc("5191", "Crédit de mobilisation de créances commerciales (CMCC)", 5, L, false, "519", "945-51"),
    acc("5193", "Mobilisation de créances nées à l'étranger", 5, L, false, "519", "945-51"),
    acc("5198", "Intérêts courus sur concours bancaires courants", 5, L, false, "519", "945-51"),
    // === 52 — Instruments financiers à terme et jetons (Art. 945-52) ===
    acc("52", "Instruments financiers à terme et jetons détenus", 5, A, true, null, "945-52"),
    acc("521", "Instruments financiers à terme", 5, A, true, "52", "945-52"),
    acc("522", "Jetons détenus", 5, A, true, "52", "945-52"),
    acc("523", "Jetons auto-détenus", 5, A, true, "52", "945-52"),
    acc("524", "Jetons empruntés", 5, A, true, "52", "945-52"),
    // === 53 — Caisse (Art. 945-53) ===
    acc("53", "Caisse", 5, A, true, null, "945-53"),
    acc("530", "Caisse", 5, A, true, "53", "945-53"),
    acc("531", "Caisse siège social", 5, A, true, "53", "945-53"),
    // === 54 — Régies d'avances et accréditifs (Art. 945-54) ===
    acc("54", "Régies d'avances et accréditifs", 5, A, true, null, "945-54"),
    // === 58 — Virements internes (Art. 945-58) ===
    acc("58", "Virements internes", 5, A, true, null, "945-58"),
    acc("580", "Virements internes", 5, A, true, "58", "945-58"),
    // === 59 — Dépréciations (Art. 945-59) ===
    // Contra-asset: credit normal
    acc("59", "Dépréciations des comptes financiers", 5, A, false, null, "945-59"),
    acc("590", "Dépréciations des valeurs mobilières de placement", 5, A, false, "59", "945-59"),
    acc("591", "Dépréciations des comptes bancaires", 5, A, false, "59", "945-59"),
];
// ============================================================================
// CLASS 6 — Comptes de charges
// Art. 946 through 946-69
//
// PCG Art. 946: "Les charges de la classe 6 sont enregistrées hors taxes
// récupérables."
// Normal balance: DEBIT
// Exceptions: 609, 619, 629 (rabais obtenus) = credit normal
//             6989 (intégration fiscale produits) = credit
//             699 (report en arrière déficits) = credit
// ============================================================================
const CLASS_6 = [
    // === 60 — Achats (Art. 946-60) ===
    acc("60", "Achats (sauf 603)", 6, X, true, null, "946-60"),
    acc("601", "Achats stockés - Matières premières (et fournitures)", 6, X, true, "60", "946-60"),
    acc("602", "Achats stockés - Autres approvisionnements", 6, X, true, "60", "946-60"),
    acc("6021", "Matières consommables", 6, X, true, "602", "946-60"),
    acc("6022", "Fournitures consommables", 6, X, true, "602", "946-60"),
    acc("6026", "Emballages", 6, X, true, "602", "946-60"),
    // 603 — Variation des stocks (Art. 946-603)
    acc("603", "Variations des stocks (approvisionnements et marchandises)", 6, X, true, "60", "946-603"),
    acc("6031", "Variation des stocks de matières premières (et fournitures)", 6, X, true, "603", "946-603"),
    acc("6032", "Variation des stocks des autres approvisionnements", 6, X, true, "603", "946-603"),
    acc("6037", "Variation des stocks de marchandises", 6, X, true, "603", "946-603"),
    acc("604", "Achats d'études et prestations de services", 6, X, true, "60", "946-60"),
    acc("605", "Achats de matériel, équipements et travaux", 6, X, true, "60", "946-60"),
    acc("606", "Achats non stockés de matières et fournitures", 6, X, true, "60", "946-60"),
    acc("6061", "Fournitures non stockables (eau, énergie)", 6, X, true, "606", "946-60"),
    acc("6063", "Fournitures d'entretien et de petit équipement", 6, X, true, "606", "946-60"),
    acc("6064", "Fournitures administratives", 6, X, true, "606", "946-60"),
    acc("6068", "Autres matières et fournitures", 6, X, true, "606", "946-60"),
    acc("607", "Achats de marchandises", 6, X, true, "60", "946-60"),
    acc("608", "Frais accessoires d'achat", 6, X, true, "60", "946-60"),
    // 609: contra-expense, credit normal
    acc("609", "Rabais, remises et ristournes obtenus sur achats", 6, X, false, "60", "946-60"),
    // === 61 — Services extérieurs (Art. 946-61/62) ===
    acc("61", "Services extérieurs", 6, X, true, null, "946-61/62"),
    acc("611", "Sous-traitance générale", 6, X, true, "61", "946-61/62"),
    acc("612", "Redevances de crédit-bail", 6, X, true, "61", "946-61/62"),
    acc("6122", "Crédit-bail mobilier", 6, X, true, "612", "946-61/62"),
    acc("6125", "Crédit-bail immobilier", 6, X, true, "612", "946-61/62"),
    acc("613", "Locations", 6, X, true, "61", "946-61/62"),
    acc("6132", "Locations immobilières", 6, X, true, "613", "946-61/62"),
    acc("6135", "Locations mobilières", 6, X, true, "613", "946-61/62"),
    acc("614", "Charges locatives et de copropriété", 6, X, true, "61", "946-61/62"),
    acc("615", "Entretien et réparations", 6, X, true, "61", "946-61/62"),
    acc("6152", "Entretien et réparations sur biens immobiliers", 6, X, true, "615", "946-61/62"),
    acc("6155", "Entretien et réparations sur biens mobiliers", 6, X, true, "615", "946-61/62"),
    acc("616", "Primes d'assurance", 6, X, true, "61", "946-61/62"),
    acc("6161", "Multirisques", 6, X, true, "616", "946-61/62"),
    acc("6162", "Assurance obligatoire dommage construction", 6, X, true, "616", "946-61/62"),
    acc("6163", "Assurance transport", 6, X, true, "616", "946-61/62"),
    acc("6164", "Risques d'exploitation", 6, X, true, "616", "946-61/62"),
    acc("6165", "Insolvabilité clients", 6, X, true, "616", "946-61/62"),
    acc("617", "Études et recherches", 6, X, true, "61", "946-61/62"),
    acc("618", "Divers", 6, X, true, "61", "946-61/62"),
    acc("6181", "Documentation générale", 6, X, true, "618", "946-61/62"),
    acc("6183", "Documentation technique", 6, X, true, "618", "946-61/62"),
    acc("6185", "Frais de colloques, séminaires, conférences", 6, X, true, "618", "946-61/62"),
    // 619: contra-expense, credit normal
    acc("619", "Rabais, remises et ristournes obtenus sur services extérieurs", 6, X, false, "61", "946-61/62"),
    // === 62 — Autres services extérieurs (Art. 946-61/62) ===
    acc("62", "Autres services extérieurs", 6, X, true, null, "946-61/62"),
    acc("621", "Personnel extérieur à l'entreprise", 6, X, true, "62", "946-61/62"),
    acc("6211", "Personnel intérimaire", 6, X, true, "621", "946-61/62"),
    acc("6214", "Personnel détaché ou prêté à l'entreprise", 6, X, true, "621", "946-61/62"),
    acc("622", "Rémunérations d'intermédiaires et honoraires", 6, X, true, "62", "946-61/62"),
    acc("6221", "Commissions et courtages sur achats", 6, X, true, "622", "946-61/62"),
    acc("6222", "Commissions et courtages sur ventes", 6, X, true, "622", "946-61/62"),
    acc("6224", "Rémunérations des transitaires", 6, X, true, "622", "946-61/62"),
    acc("6225", "Rémunérations d'affacturage", 6, X, true, "622", "946-61/62"),
    acc("6226", "Honoraires", 6, X, true, "622", "946-61/62"),
    acc("6227", "Frais d'actes et de contentieux", 6, X, true, "622", "946-61/62"),
    acc("6228", "Divers", 6, X, true, "622", "946-61/62"),
    acc("623", "Publicité, publications, relations publiques", 6, X, true, "62", "946-61/62"),
    acc("6231", "Annonces et insertions", 6, X, true, "623", "946-61/62"),
    acc("6233", "Foires et expositions", 6, X, true, "623", "946-61/62"),
    acc("6234", "Cadeaux à la clientèle", 6, X, true, "623", "946-61/62"),
    acc("6236", "Catalogues et imprimés", 6, X, true, "623", "946-61/62"),
    acc("6237", "Publications", 6, X, true, "623", "946-61/62"),
    acc("6238", "Divers (pourboires, dons courants)", 6, X, true, "623", "946-61/62"),
    acc("624", "Transports de biens et transports collectifs du personnel", 6, X, true, "62", "946-61/62"),
    acc("6241", "Transports sur achats", 6, X, true, "624", "946-61/62"),
    acc("6242", "Transports sur ventes", 6, X, true, "624", "946-61/62"),
    acc("6243", "Transports entre établissements ou chantiers", 6, X, true, "624", "946-61/62"),
    acc("6244", "Transports administratifs", 6, X, true, "624", "946-61/62"),
    acc("6247", "Transports collectifs du personnel", 6, X, true, "624", "946-61/62"),
    acc("6248", "Divers", 6, X, true, "624", "946-61/62"),
    acc("625", "Déplacements, missions et réceptions", 6, X, true, "62", "946-61/62"),
    acc("6251", "Voyages et déplacements", 6, X, true, "625", "946-61/62"),
    acc("6255", "Frais de déménagement", 6, X, true, "625", "946-61/62"),
    acc("6256", "Missions", 6, X, true, "625", "946-61/62"),
    acc("6257", "Réceptions", 6, X, true, "625", "946-61/62"),
    acc("626", "Frais postaux et de télécommunications", 6, X, true, "62", "946-61/62"),
    acc("627", "Services bancaires et assimilés", 6, X, true, "62", "946-61/62"),
    acc("6271", "Frais sur titres (achat, vente, garde)", 6, X, true, "627", "946-61/62"),
    acc("6272", "Commissions et frais sur émission d'emprunts", 6, X, true, "627", "946-61/62"),
    acc("6275", "Frais sur effets", 6, X, true, "627", "946-61/62"),
    acc("6278", "Autres frais et commissions sur prestations de services", 6, X, true, "627", "946-61/62"),
    acc("628", "Divers", 6, X, true, "62", "946-61/62"),
    acc("6281", "Cotisations (chambres syndicales, professionnelles)", 6, X, true, "628", "946-61/62"),
    // 629: contra-expense, credit normal
    acc("629", "Rabais, remises et ristournes obtenus sur autres services extérieurs", 6, X, false, "62", "946-61/62"),
    // === 63 — Impôts, taxes (Art. 946-63) ===
    acc("63", "Impôts, taxes et versements assimilés", 6, X, true, null, "946-63"),
    acc("631", "Impôts, taxes et versements assimilés sur rémunérations (administration des impôts)", 6, X, true, "63", "946-63"),
    acc("6311", "Taxe sur les salaires", 6, X, true, "631", "946-63"),
    acc("6312", "Taxe d'apprentissage", 6, X, true, "631", "946-63"),
    acc("6313", "Participation des employeurs à la formation professionnelle continue", 6, X, true, "631", "946-63"),
    acc("6314", "Cotisation pour défaut d'investissement obligatoire dans la construction", 6, X, true, "631", "946-63"),
    acc("633", "Impôts, taxes et versements assimilés sur rémunérations (autres organismes)", 6, X, true, "63", "946-63"),
    acc("6331", "Versement de transport", 6, X, true, "633", "946-63"),
    acc("6332", "Allocation logement", 6, X, true, "633", "946-63"),
    acc("6333", "Participation des employeurs à la formation professionnelle continue", 6, X, true, "633", "946-63"),
    acc("6334", "Participation des employeurs à l'effort de construction", 6, X, true, "633", "946-63"),
    acc("6335", "Versements libératoires ouvrant droit à l'exonération de la taxe d'apprentissage", 6, X, true, "633", "946-63"),
    acc("635", "Autres impôts, taxes et versements assimilés (administration des impôts)", 6, X, true, "63", "946-63"),
    acc("6351", "Impôts directs (sauf impôt sur les bénéfices)", 6, X, true, "635", "946-63"),
    acc("63511", "Contribution économique territoriale", 6, X, true, "6351", "946-63"),
    acc("63512", "Taxes foncières", 6, X, true, "6351", "946-63"),
    acc("63513", "Autres impôts locaux", 6, X, true, "6351", "946-63"),
    acc("63514", "Taxe sur les véhicules de sociétés", 6, X, true, "6351", "946-63"),
    acc("6352", "Taxes sur le chiffre d'affaires non récupérables", 6, X, true, "635", "946-63"),
    acc("6353", "Impôts indirects", 6, X, true, "635", "946-63"),
    acc("6354", "Droits d'enregistrement et de timbre", 6, X, true, "635", "946-63"),
    acc("6358", "Autres droits", 6, X, true, "635", "946-63"),
    acc("637", "Autres impôts, taxes et versements assimilés (autres organismes)", 6, X, true, "63", "946-63"),
    acc("6371", "Contribution sociale de solidarité à la charge des sociétés", 6, X, true, "637", "946-63"),
    acc("6374", "Impôts et taxes exigibles à l'étranger", 6, X, true, "637", "946-63"),
    acc("6378", "Taxes diverses", 6, X, true, "637", "946-63"),
    // === 64 — Charges de personnel (Art. 946-64) ===
    acc("64", "Charges de personnel", 6, X, true, null, "946-64"),
    acc("641", "Rémunérations du personnel", 6, X, true, "64", "946-64"),
    acc("6411", "Salaires, appointements", 6, X, true, "641", "946-64"),
    acc("6412", "Congés payés", 6, X, true, "641", "946-64"),
    acc("6413", "Primes et gratifications", 6, X, true, "641", "946-64"),
    acc("6414", "Indemnités et avantages divers", 6, X, true, "641", "946-64"),
    acc("6415", "Supplément familial", 6, X, true, "641", "946-64"),
    acc("644", "Rémunération du travail de l'exploitant", 6, X, true, "64", "946-64"),
    acc("645", "Charges de sécurité sociale et de prévoyance", 6, X, true, "64", "946-64"),
    acc("6451", "Cotisations à l'URSSAF", 6, X, true, "645", "946-64"),
    acc("6452", "Cotisations aux mutuelles", 6, X, true, "645", "946-64"),
    acc("6453", "Cotisations aux caisses de retraite et de prévoyance", 6, X, true, "645", "946-64"),
    acc("6454", "Cotisations aux ASSEDIC", 6, X, true, "645", "946-64"),
    acc("6458", "Cotisations aux autres organismes sociaux", 6, X, true, "645", "946-64"),
    acc("646", "Cotisations sociales personnelles de l'exploitant", 6, X, true, "64", "946-64"),
    acc("647", "Autres charges sociales", 6, X, true, "64", "946-64"),
    acc("6471", "Prestations directes", 6, X, true, "647", "946-64"),
    acc("6472", "Versements aux comités d'entreprise et d'établissement", 6, X, true, "647", "946-64"),
    acc("6473", "Versements aux comités d'hygiène et de sécurité", 6, X, true, "647", "946-64"),
    acc("6474", "Versements aux autres œuvres sociales", 6, X, true, "647", "946-64"),
    acc("6475", "Médecine du travail, pharmacie", 6, X, true, "647", "946-64"),
    acc("648", "Autres charges de personnel", 6, X, true, "64", "946-64"),
    // === 65 — Autres charges de gestion courante (Art. 946-65) ===
    acc("65", "Autres charges de gestion courante", 6, X, true, null, "946-65"),
    acc("651", "Redevances pour concessions, brevets, licences, marques, procédés, logiciels, droits et valeurs similaires", 6, X, true, "65", "946-65"),
    acc("653", "Jetons de présence", 6, X, true, "65", "946-65"),
    acc("654", "Pertes sur créances irrécouvrables", 6, X, true, "65", "946-65"),
    acc("655", "Quote-parts de résultat sur opérations faites en commun", 6, X, true, "65", "946-65"),
    acc("656", "Pertes de change sur créances et dettes commerciales", 6, X, true, "65", "946-65"),
    acc("658", "Charges diverses de gestion courante", 6, X, true, "65", "946-65"),
    // === 66 — Charges financières (Art. 946-66) ===
    acc("66", "Charges financières", 6, X, true, null, "946-66"),
    acc("661", "Charges d'intérêts", 6, X, true, "66", "946-66"),
    acc("6611", "Intérêts des emprunts et dettes", 6, X, true, "661", "946-66"),
    acc("6615", "Intérêts des comptes courants et des dépôts créditeurs", 6, X, true, "661", "946-66"),
    acc("6616", "Intérêts bancaires et sur opérations de financement", 6, X, true, "661", "946-66"),
    acc("6617", "Intérêts des obligations cautionnées", 6, X, true, "661", "946-66"),
    acc("6618", "Intérêts des autres dettes", 6, X, true, "661", "946-66"),
    acc("664", "Pertes sur créances liées à des participations", 6, X, true, "66", "946-66"),
    acc("665", "Escomptes accordés", 6, X, true, "66", "946-66"),
    acc("666", "Pertes de change financières", 6, X, true, "66", "946-66"),
    acc("6661", "Charges nettes sur cessions de jetons", 6, X, true, "666", "945-52"),
    acc("667", "Charges nettes sur cessions de valeurs mobilières de placement", 6, X, true, "66", "946-66"),
    acc("668", "Autres charges financières", 6, X, true, "66", "946-66"),
    // === 67 — Charges exceptionnelles (Art. 946-67) ===
    acc("67", "Charges exceptionnelles", 6, X, true, null, "946-67"),
    acc("671", "Charges exceptionnelles sur opérations de gestion", 6, X, true, "67", "946-67"),
    acc("6711", "Pénalités sur marchés et dédits", 6, X, true, "671", "946-67"),
    acc("6712", "Pénalités, amendes fiscales et pénales", 6, X, true, "671", "946-67"),
    acc("6713", "Dons, libéralités", 6, X, true, "671", "946-67"),
    acc("6714", "Créances devenues irrécouvrables dans l'exercice", 6, X, true, "671", "946-67"),
    acc("6715", "Subventions accordées", 6, X, true, "671", "946-67"),
    acc("6717", "Rappels d'impôts (autres qu'impôts sur les bénéfices)", 6, X, true, "671", "946-67"),
    acc("6718", "Autres charges exceptionnelles sur opérations de gestion", 6, X, true, "671", "946-67"),
    acc("675", "Valeurs comptables des éléments d'actif cédés", 6, X, true, "67", "946-67"),
    acc("678", "Autres charges exceptionnelles", 6, X, true, "67", "946-67"),
    // === 68 — Dotations aux amortissements, dépréciations et provisions (Art. 946-68) ===
    acc("68", "Dotations aux amortissements, aux dépréciations et aux provisions", 6, X, true, null, "946-68"),
    acc("681", "Dotations aux amortissements, dépréciations et provisions - Charges d'exploitation", 6, X, true, "68", "946-68"),
    acc("6811", "Dotations aux amortissements sur immobilisations incorporelles et corporelles", 6, X, true, "681", "946-68"),
    acc("6812", "Dotations aux amortissements des charges d'exploitation à répartir", 6, X, true, "681", "946-68"),
    acc("6815", "Dotations aux provisions d'exploitation", 6, X, true, "681", "946-68"),
    acc("6816", "Dotations aux dépréciations des immobilisations incorporelles et corporelles", 6, X, true, "681", "946-68"),
    acc("6817", "Dotations aux dépréciations des actifs circulants", 6, X, true, "681", "946-68"),
    acc("686", "Dotations aux amortissements, dépréciations et provisions - Charges financières", 6, X, true, "68", "946-68"),
    acc("6861", "Dotations aux amortissements des primes de remboursement des obligations", 6, X, true, "686", "946-68"),
    acc("6865", "Dotations aux provisions financières", 6, X, true, "686", "946-68"),
    acc("6866", "Dotations aux dépréciations des éléments financiers", 6, X, true, "686", "946-68"),
    acc("687", "Dotations aux amortissements, dépréciations et provisions - Charges exceptionnelles", 6, X, true, "68", "946-68"),
    acc("6871", "Dotations aux amortissements exceptionnels des immobilisations", 6, X, true, "687", "946-68"),
    acc("6872", "Dotations aux provisions réglementées (immobilisations)", 6, X, true, "687", "946-68"),
    acc("6873", "Dotations aux provisions réglementées (stocks)", 6, X, true, "687", "946-68"),
    acc("6874", "Dotations aux autres provisions réglementées", 6, X, true, "687", "946-68"),
    acc("6875", "Dotations aux provisions exceptionnelles", 6, X, true, "687", "946-68"),
    acc("6876", "Dotations aux dépréciations exceptionnelles", 6, X, true, "687", "946-68"),
    // === 69 — Participation des salariés — IS (Art. 946-69) ===
    acc("69", "Participation des salariés - Impôts sur les bénéfices et assimilés", 6, X, true, null, "946-69"),
    acc("691", "Participation des salariés aux résultats", 6, X, true, "69", "946-69"),
    acc("695", "Impôts sur les bénéfices", 6, X, true, "69", "946-69"),
    acc("6951", "Impôts dus en France", 6, X, true, "695", "946-69"),
    acc("6952", "Contribution additionnelle à l'impôt sur les bénéfices", 6, X, true, "695", "946-69"),
    acc("6954", "Impôts dus à l'étranger", 6, X, true, "695", "946-69"),
    acc("696", "Suppléments d'impôt sur les sociétés liés aux distributions", 6, X, true, "69", "946-69"),
    acc("698", "Intégration fiscale", 6, X, true, "69", "946-69"),
    acc("6981", "Intégration fiscale - Charges", 6, X, true, "698", "946-69"),
    // 6989: credit normal (produit within charges class)
    acc("6989", "Intégration fiscale - Produits", 6, X, false, "698", "946-69"),
    // 699: credit normal (produit within charges class)
    acc("699", "Produits - Report en arrière des déficits", 6, X, false, "69", "946-69"),
];
// ============================================================================
// CLASS 7 — Comptes de produits
// Art. 947 through 947-79
//
// PCG Art. 947: "Les produits de la classe 7 sont enregistrés hors taxes
// collectées."
// Normal balance: CREDIT
// Exceptions: 709 (rabais accordés) = debit normal
//             7091-7098 subdivisions of 709 = debit normal
// ============================================================================
const CLASS_7 = [
    // === 70 — Ventes (Art. 947-70) ===
    acc("70", "Ventes de produits fabriqués, prestations de services, marchandises", 7, R, false, null, "947-70"),
    acc("701", "Ventes de produits finis", 7, R, false, "70", "947-70"),
    acc("702", "Ventes de produits intermédiaires", 7, R, false, "70", "947-70"),
    acc("703", "Ventes de produits résiduels", 7, R, false, "70", "947-70"),
    acc("704", "Travaux", 7, R, false, "70", "947-70"),
    acc("705", "Études", 7, R, false, "70", "947-70"),
    acc("706", "Prestations de services", 7, R, false, "70", "947-70"),
    acc("707", "Ventes de marchandises", 7, R, false, "70", "947-70"),
    acc("708", "Produits des activités annexes", 7, R, false, "70", "947-70"),
    acc("7081", "Produits des services exploités dans l'intérêt du personnel", 7, R, false, "708", "947-70"),
    acc("7082", "Commissions et courtages", 7, R, false, "708", "947-70"),
    acc("7083", "Locations diverses", 7, R, false, "708", "947-70"),
    acc("7084", "Mise à disposition de personnel facturée", 7, R, false, "708", "947-70"),
    acc("7085", "Ports et frais accessoires facturés", 7, R, false, "708", "947-70"),
    acc("7088", "Autres produits d'activités annexes", 7, R, false, "708", "947-70"),
    // 709: contra-revenue, debit normal
    acc("709", "Rabais, remises et ristournes accordés par l'entreprise", 7, R, true, "70", "947-70"),
    acc("7091", "sur ventes de produits finis", 7, R, true, "709", "947-70"),
    acc("7092", "sur ventes de produits intermédiaires", 7, R, true, "709", "947-70"),
    acc("7094", "sur travaux", 7, R, true, "709", "947-70"),
    acc("7095", "sur études", 7, R, true, "709", "947-70"),
    acc("7096", "sur prestations de services", 7, R, true, "709", "947-70"),
    acc("7097", "sur ventes de marchandises", 7, R, true, "709", "947-70"),
    acc("7098", "sur produits des activités annexes", 7, R, true, "709", "947-70"),
    // === 71 — Production stockée (Art. 947-71) ===
    acc("71", "Production stockée (ou déstockage)", 7, R, false, null, "947-71"),
    acc("713", "Variation des stocks (en-cours de production, produits)", 7, R, false, "71", "947-71"),
    acc("7133", "Variation des en-cours de production de biens", 7, R, false, "713", "947-71"),
    acc("7134", "Variation des en-cours de production de services", 7, R, false, "713", "947-71"),
    acc("7135", "Variation des stocks de produits", 7, R, false, "713", "947-71"),
    // === 72 — Production immobilisée (Art. 947-72) ===
    acc("72", "Production immobilisée", 7, R, false, null, "947-72"),
    acc("721", "Immobilisations incorporelles", 7, R, false, "72", "947-72"),
    acc("722", "Immobilisations corporelles", 7, R, false, "72", "947-72"),
    // === 73 — Produits nets partiels sur opérations à long terme (Art. 947) ===
    // TODO: The PCG mentions account 73 in Art. 947 but does not provide detailed
    // subdivision in the nomenclature section. Included as category only.
    acc("73", "Produits nets partiels sur opérations à long terme", 7, R, false, null, "947"),
    // === 74 — Subventions d'exploitation (Art. 947-74) ===
    acc("74", "Subventions d'exploitation", 7, R, false, null, "947-74"),
    acc("740", "Subventions d'exploitation", 7, R, false, "74", "947-74"),
    acc("741", "Subventions reçues de l'État", 7, R, false, "74", "947-74"),
    acc("742", "Subventions reçues des collectivités locales", 7, R, false, "74", "947-74"),
    acc("748", "Autres subventions d'exploitation", 7, R, false, "74", "947-74"),
    // === 75 — Autres produits de gestion courante (Art. 947-75) ===
    acc("75", "Autres produits de gestion courante", 7, R, false, null, "947-75"),
    acc("751", "Redevances pour concessions, brevets, licences, marques, procédés, logiciels, droits et valeurs similaires", 7, R, false, "75", "947-75"),
    acc("752", "Revenus des immeubles non affectés aux activités professionnelles", 7, R, false, "75", "947-75"),
    acc("753", "Jetons de présence et rémunérations d'administrateurs, gérants", 7, R, false, "75", "947-75"),
    acc("754", "Ristournes perçues des coopératives (provenant des excédents)", 7, R, false, "75", "947-75"),
    acc("755", "Quote-parts de résultat sur opérations faites en commun", 7, R, false, "75", "947-75"),
    acc("756", "Gains de change sur créances et dettes commerciales", 7, R, false, "75", "947-75"),
    acc("758", "Produits divers de gestion courante", 7, R, false, "75", "947-75"),
    // === 76 — Produits financiers (Art. 947-76) ===
    acc("76", "Produits financiers", 7, R, false, null, "947-76"),
    acc("761", "Produits de participations", 7, R, false, "76", "947-76"),
    acc("7611", "Revenus des titres de participation", 7, R, false, "761", "947-76"),
    acc("7616", "Revenus sur autres formes de participation", 7, R, false, "761", "947-76"),
    acc("7617", "Revenus de créances rattachées à des participations", 7, R, false, "761", "947-76"),
    acc("762", "Produits des autres immobilisations financières", 7, R, false, "76", "947-76"),
    acc("7621", "Revenus des titres immobilisés", 7, R, false, "762", "947-76"),
    acc("7624", "Revenus des prêts", 7, R, false, "762", "947-76"),
    acc("7626", "Revenus d'escomptes obtenus", 7, R, false, "762", "947-76"),
    acc("7627", "Revenus des créances diverses", 7, R, false, "762", "947-76"),
    // TODO: Art. 947-76 mentions 763 "Revenus des autres créances" but no detailed subdivision
    acc("764", "Revenus des valeurs mobilières de placement", 7, R, false, "76", "947-76"),
    acc("765", "Escomptes obtenus", 7, R, false, "76", "947-76"),
    acc("766", "Gains de change financiers", 7, R, false, "76", "947-76"),
    acc("7661", "Produits nets sur cessions de jetons", 7, R, false, "766", "945-52"),
    acc("767", "Produits nets sur cessions de valeurs mobilières de placement", 7, R, false, "76", "947-76"),
    acc("768", "Autres produits financiers", 7, R, false, "76", "947-76"),
    // === 77 — Produits exceptionnels (Art. 947-77) ===
    acc("77", "Produits exceptionnels", 7, R, false, null, "947-77"),
    acc("771", "Produits exceptionnels sur opérations de gestion", 7, R, false, "77", "947-77"),
    acc("7711", "Dédits et pénalités perçus sur achats et ventes", 7, R, false, "771", "947-77"),
    acc("7713", "Libéralités reçues", 7, R, false, "771", "947-77"),
    acc("7714", "Rentrées sur créances amorties", 7, R, false, "771", "947-77"),
    acc("7715", "Subventions d'équilibre", 7, R, false, "771", "947-77"),
    acc("7717", "Dégrèvements d'impôts (autres qu'impôts sur les bénéfices)", 7, R, false, "771", "947-77"),
    acc("7718", "Autres produits exceptionnels sur opérations de gestion", 7, R, false, "771", "947-77"),
    acc("775", "Produits des cessions d'éléments d'actif", 7, R, false, "77", "947-77"),
    acc("777", "Quote-part des subventions d'investissement virée au résultat de l'exercice", 7, R, false, "77", "947-77"),
    acc("778", "Autres produits exceptionnels", 7, R, false, "77", "947-77"),
    // === 78 — Reprises (Art. 947-78) ===
    acc("78", "Reprises sur amortissements, dépréciations et provisions", 7, R, false, null, "947-78"),
    acc("781", "Reprises sur amortissements, dépréciations et provisions (à inscrire dans les produits d'exploitation)", 7, R, false, "78", "947-78"),
    acc("7811", "Reprises sur amortissements des immobilisations incorporelles et corporelles", 7, R, false, "781", "947-78"),
    acc("7815", "Reprises sur provisions d'exploitation", 7, R, false, "781", "947-78"),
    acc("7816", "Reprises sur dépréciations des immobilisations incorporelles et corporelles", 7, R, false, "781", "947-78"),
    acc("7817", "Reprises sur dépréciations des actifs circulants", 7, R, false, "781", "947-78"),
    acc("786", "Reprises sur dépréciations et provisions (à inscrire dans les produits financiers)", 7, R, false, "78", "947-78"),
    acc("7865", "Reprises sur provisions financières", 7, R, false, "786", "947-78"),
    acc("7866", "Reprises sur dépréciations des éléments financiers", 7, R, false, "786", "947-78"),
    acc("787", "Reprises sur dépréciations et provisions (à inscrire dans les produits exceptionnels)", 7, R, false, "78", "947-78"),
    acc("7871", "Reprises sur amortissements exceptionnels des immobilisations", 7, R, false, "787", "947-78"),
    acc("7872", "Reprises sur provisions réglementées (immobilisations)", 7, R, false, "787", "947-78"),
    acc("7873", "Reprises sur provisions réglementées (stocks)", 7, R, false, "787", "947-78"),
    acc("7874", "Reprises sur autres provisions réglementées", 7, R, false, "787", "947-78"),
    acc("7875", "Reprises sur provisions exceptionnelles", 7, R, false, "787", "947-78"),
    acc("7876", "Reprises sur dépréciations exceptionnelles", 7, R, false, "787", "947-78"),
    // === 79 — Transferts de charges (Art. 947-79) ===
    acc("79", "Transferts de charges", 7, R, false, null, "947-79"),
    acc("791", "Transferts de charges d'exploitation", 7, R, false, "79", "947-79"),
    acc("796", "Transferts de charges financières", 7, R, false, "79", "947-79"),
    acc("797", "Transferts de charges exceptionnelles", 7, R, false, "79", "947-79"),
];
// ============================================================================
// CLASS 8 — Comptes spéciaux
// Art. 948-80 through 948-89
//
// These accounts are not balance sheet or P&L accounts.
// They record off-balance-sheet commitments and special operations.
// ============================================================================
const CLASS_8 = [
    // === 80 — Engagements (Art. 948-80) ===
    acc("80", "Engagements", 8, A, true, null, "948-80"),
    acc("801", "Engagements donnés par l'entité", 8, A, true, "80", "948-80"),
    acc("8011", "Avals, cautions, garanties donnés", 8, A, true, "801", "948-80"),
    acc("8014", "Effets circulant sous l'endos de l'entité", 8, A, true, "801", "948-80"),
    acc("8016", "Redevances crédit-bail restant à courir", 8, A, true, "801", "948-80"),
    acc("80161", "Crédit-bail mobilier", 8, A, true, "8016", "948-80"),
    acc("80165", "Crédit-bail immobilier", 8, A, true, "8016", "948-80"),
    acc("8018", "Autres engagements donnés", 8, A, true, "801", "948-80"),
    acc("802", "Engagements reçus par l'entité", 8, A, false, "80", "948-80"),
    acc("8021", "Avals, cautions, garanties reçus", 8, A, false, "802", "948-80"),
    acc("8024", "Créances escomptées non échues", 8, A, false, "802", "948-80"),
    acc("8026", "Engagements reçus pour utilisation en crédit-bail", 8, A, false, "802", "948-80"),
    acc("80261", "Crédit-bail mobilier", 8, A, false, "8026", "948-80"),
    acc("80265", "Crédit-bail immobilier", 8, A, false, "8026", "948-80"),
    acc("8028", "Autres engagements reçus", 8, A, false, "802", "948-80"),
    acc("809", "Contrepartie des engagements", 8, A, true, "80", "948-80"),
    acc("8091", "Contrepartie 801", 8, A, true, "809", "948-80"),
    acc("8092", "Contrepartie 802", 8, A, true, "809", "948-80"),
    // === 88 — Résultat en instance d'affectation (Art. 948-88) ===
    acc("88", "Résultat en instance d'affectation", 8, E, false, null, "948-88"),
    // === 89 — Bilan (Art. 948-89) ===
    acc("89", "Bilan", 8, A, true, null, "948-89"),
    acc("890", "Bilan d'ouverture", 8, A, true, "89", "948-89"),
    acc("891", "Bilan de clôture", 8, A, true, "89", "948-89"),
];
// ============================================================================
// FULL PCG — All classes combined
// ============================================================================
/** Complete PCG chart of accounts — all standard accounts Classes 1-8
 *  per Règlement ANC N° 2014-03, Livre III, Chapitre III */
export const PCG_ACCOUNTS_FULL = [
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
const _accountsByCode = new Map();
for (const a of PCG_ACCOUNTS_FULL) {
    _accountsByCode.set(a.code, a);
}
/** Get account definition by code */
export function getAccountByCode(code) {
    return _accountsByCode.get(code);
}
/** Get all accounts for a given class */
export function getAccountsByClass(cls) {
    return PCG_ACCOUNTS_FULL.filter((a) => a.class === cls);
}
/** Get all child accounts of a parent */
export function getChildAccounts(parentCode) {
    return PCG_ACCOUNTS_FULL.filter((a) => a.parentCode === parentCode);
}
/** Get all accounts whose code starts with a prefix */
export function getAccountsByPrefix(prefix) {
    return PCG_ACCOUNTS_FULL.filter((a) => a.code.startsWith(prefix));
}
/** Get the full hierarchy path for an account (from root down to account) */
export function getAccountHierarchy(code) {
    const result = [];
    let current = _accountsByCode.get(code);
    while (current) {
        result.unshift(current);
        current = current.parentCode ? _accountsByCode.get(current.parentCode) : undefined;
    }
    return result;
}
/** Check if an account code exists in the PCG */
export function isValidPcgAccount(code) {
    return _accountsByCode.has(code);
}
/** Get all leaf accounts (accounts with no children) */
export function getLeafAccounts() {
    const parentCodes = new Set(PCG_ACCOUNTS_FULL.map((a) => a.parentCode).filter((p) => p !== null));
    return PCG_ACCOUNTS_FULL.filter((a) => !parentCodes.has(a.code));
}
/** Get all accounts of a specific type */
export function getAccountsByType(typeId) {
    return PCG_ACCOUNTS_FULL.filter((a) => a.typeId === typeId);
}
//# sourceMappingURL=chart-of-accounts-full.js.map