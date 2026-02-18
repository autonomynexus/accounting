import type { Monetary } from "monetary";
import { add, subtract, multiply, monetary, EUR } from "monetary";
import type { AccountBalance } from "../models.js";
import type {
  FiscalPeriod,
  Form2050,
  Form2051,
  Form2052,
  Form2053,
  Form2054,
  Form2055,
  Form2056,
  Form2057,
  Form2058A,
  Form2059E,
  Form2065,
  BilanActifLine,
  BilanPassifLine,
  LiasseFiscale,
  LiasseFiscaleSnapshot,
} from "./models.js";

// ============================================================================
// Helpers
// ============================================================================

const ZERO = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

/** Sum balances for accounts matching a prefix set */
function sumBalances(
  balances: readonly AccountBalance[],
  prefixes: readonly string[],
): Monetary<number> {
  let total = ZERO();
  for (const b of balances) {
    if (prefixes.some((p) => b.accountCode.startsWith(p))) {
      total = add(total, b.balance);
    }
  }
  return total;
}

/** Sum debit totals for matching accounts */
function sumDebits(
  balances: readonly AccountBalance[],
  prefixes: readonly string[],
): Monetary<number> {
  let total = ZERO();
  for (const b of balances) {
    if (prefixes.some((p) => b.accountCode.startsWith(p))) {
      total = add(total, b.debitTotal);
    }
  }
  return total;
}

/** Sum credit totals for matching accounts */
function sumCredits(
  balances: readonly AccountBalance[],
  prefixes: readonly string[],
): Monetary<number> {
  let total = ZERO();
  for (const b of balances) {
    if (prefixes.some((p) => b.accountCode.startsWith(p))) {
      total = add(total, b.creditTotal);
    }
  }
  return total;
}

/** Negate a monetary value */
function negate(m: Monetary<number>): Monetary<number> {
  return multiply(m, -1);
}

function actifLine(
  label: string,
  brut: Monetary<number>,
  amort: Monetary<number>,
): BilanActifLine {
  return {
    label,
    brut,
    amortissementsProvisions: amort,
    net: subtract(brut, amort),
  };
}

function passifLine(label: string, montant: Monetary<number>): BilanPassifLine {
  return { label, montant };
}

// ============================================================================
// 2050 — Bilan Actif
// ============================================================================

export function compute2050(balances: readonly AccountBalance[]): Form2050 {
  const immoIncorp = actifLine(
    "Immobilisations incorporelles",
    sumBalances(balances, ["20"]),
    negate(sumBalances(balances, ["280"])),
  );
  const immoCorp = actifLine(
    "Immobilisations corporelles",
    sumBalances(balances, ["21", "22", "23"]),
    negate(sumBalances(balances, ["281", "282"])),
  );
  const immoFin = actifLine(
    "Immobilisations financières",
    sumBalances(balances, ["26", "27"]),
    negate(sumBalances(balances, ["296", "297"])),
  );
  const totalImmo = actifLine(
    "Total actif immobilisé",
    add(add(immoIncorp.brut, immoCorp.brut), immoFin.brut),
    add(
      add(immoIncorp.amortissementsProvisions, immoCorp.amortissementsProvisions),
      immoFin.amortissementsProvisions,
    ),
  );

  const stocks = actifLine("Stocks et en-cours", sumBalances(balances, ["3"]), ZERO());
  const creancesClients = actifLine(
    "Créances clients",
    sumBalances(balances, ["411"]),
    negate(sumBalances(balances, ["491"])),
  );
  const autresCreances = actifLine(
    "Autres créances",
    sumBalances(balances, ["40", "42", "43", "44", "45", "46"]),
    ZERO(),
  );
  const disponibilites = actifLine(
    "Disponibilités",
    sumBalances(balances, ["5"]),
    ZERO(),
  );
  const chargesConstatees = actifLine(
    "Charges constatées d'avance",
    sumBalances(balances, ["486"]),
    ZERO(),
  );

  const totalCirculantBrut = [stocks, creancesClients, autresCreances, disponibilites, chargesConstatees]
    .reduce((acc, l) => add(acc, l.brut), ZERO());
  const totalCirculant = actifLine(
    "Total actif circulant",
    totalCirculantBrut,
    creancesClients.amortissementsProvisions,
  );

  const totalActif = actifLine(
    "TOTAL ACTIF",
    add(totalImmo.brut, totalCirculant.brut),
    add(totalImmo.amortissementsProvisions, totalCirculant.amortissementsProvisions),
  );

  return {
    _tag: "Form2050",
    immobilisationsIncorporelles: immoIncorp,
    immobilisationsCorporelles: immoCorp,
    immobilisationsFinancieres: immoFin,
    totalActifImmobilise: totalImmo,
    stocks,
    creancesClients,
    autresCreances,
    disponibilites,
    chargesConstatees,
    totalActifCirculant: totalCirculant,
    totalActif,
  };
}

// ============================================================================
// 2051 — Bilan Passif
// ============================================================================

export function compute2051(balances: readonly AccountBalance[]): Form2051 {
  const capitalSocial = passifLine(
    "Capital social",
    subtract(sumCredits(balances, ["101"]), sumDebits(balances, ["101"])),
  );
  const reserves = passifLine(
    "Réserves",
    subtract(sumCredits(balances, ["106"]), sumDebits(balances, ["106"])),
  );
  const reportANouveau = passifLine("Report à nouveau", negate(sumBalances(balances, ["11"])));
  const resultatExercice = passifLine("Résultat de l'exercice", negate(sumBalances(balances, ["12"])));

  const totalCP = passifLine(
    "Total capitaux propres",
    [capitalSocial, reserves, reportANouveau, resultatExercice]
      .reduce((acc, l) => add(acc, l.montant), ZERO()),
  );

  const provisions = passifLine("Provisions", negate(sumBalances(balances, ["15"])));
  const emprunts = passifLine("Emprunts et dettes financières", negate(sumBalances(balances, ["16"])));
  const dettesFournisseurs = passifLine("Dettes fournisseurs", negate(sumBalances(balances, ["401"])));
  const dettesFiscalesSociales = passifLine(
    "Dettes fiscales et sociales",
    negate(sumBalances(balances, ["43", "44"])),
  );
  const autresDettes = passifLine("Autres dettes", negate(sumBalances(balances, ["45", "46"])));
  const produitsConstates = passifLine(
    "Produits constatés d'avance",
    negate(sumBalances(balances, ["487"])),
  );

  const totalDettes = passifLine(
    "Total dettes",
    [emprunts, dettesFournisseurs, dettesFiscalesSociales, autresDettes, produitsConstates]
      .reduce((acc, l) => add(acc, l.montant), ZERO()),
  );

  const totalPassif = passifLine(
    "TOTAL PASSIF",
    add(add(totalCP.montant, provisions.montant), totalDettes.montant),
  );

  return {
    _tag: "Form2051",
    capitalSocial,
    reserves,
    reportANouveau,
    resultatExercice,
    totalCapitauxPropres: totalCP,
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

export function compute2052(balances: readonly AccountBalance[]): Form2052 {
  const achatsMarchandises = sumBalances(balances, ["607"]);
  const variationStockMarchandises = sumBalances(balances, ["6037"]);
  const achatsMatieresPremieres = sumBalances(balances, ["601", "602"]);
  const variationStockMatieres = sumBalances(balances, ["6031", "6032"]);
  const autresAchatsChargesExternes = sumBalances(balances, ["604", "605", "606", "61", "62"]);
  const impotsTaxes = sumBalances(balances, ["63"]);
  const salaires = sumBalances(balances, ["641"]);
  const chargesSociales = sumBalances(balances, ["645", "646", "647"]);
  const dotationsAmortissementsProvisions = sumBalances(balances, ["68"]);
  const autresCharges = sumBalances(balances, ["65"]);
  const chargesFinancieres = sumBalances(balances, ["66"]);
  const chargesExceptionnelles = sumBalances(balances, ["67"]);
  const impotBenefices = sumBalances(balances, ["695", "696", "697", "698", "699"]);

  const allCharges = [
    achatsMarchandises, variationStockMarchandises, achatsMatieresPremieres,
    variationStockMatieres, autresAchatsChargesExternes, impotsTaxes,
    salaires, chargesSociales, dotationsAmortissementsProvisions,
    autresCharges, chargesFinancieres, chargesExceptionnelles, impotBenefices,
  ];
  const totalCharges = allCharges.reduce((acc, c) => add(acc, c), ZERO());

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

export function compute2053(balances: readonly AccountBalance[]): Form2053 {
  // Revenue accounts (class 7) have credit-normal balances → negate for positive display
  const ventesMarchandises = negate(sumBalances(balances, ["707"]));
  const productionVendueBiens = negate(sumBalances(balances, ["701", "702"]));
  const productionVendueServices = negate(sumBalances(balances, ["706"]));
  const productionStockee = negate(sumBalances(balances, ["71"]));
  const productionImmobilisee = negate(sumBalances(balances, ["72"]));
  const subventionsExploitation = negate(sumBalances(balances, ["74"]));
  const reprisesProvisions = negate(sumBalances(balances, ["78"]));
  const autresProduits = negate(sumBalances(balances, ["75"]));
  const produitsFinanciers = negate(sumBalances(balances, ["76"]));
  const produitsExceptionnels = negate(sumBalances(balances, ["77"]));

  const allProduits = [
    ventesMarchandises, productionVendueBiens, productionVendueServices,
    productionStockee, productionImmobilisee, subventionsExploitation,
    reprisesProvisions, autresProduits, produitsFinanciers, produitsExceptionnels,
  ];
  const totalProduits = allProduits.reduce((acc, p) => add(acc, p), ZERO());

  // Result = total produits - total charges
  const totalCharges = sumBalances(balances, ["6"]);
  const totalProduitsFromAccounts = negate(sumBalances(balances, ["7"]));
  const resultat = subtract(totalProduitsFromAccounts, totalCharges);

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
// 2054 — Immobilisations (simplified: first exercise = all acquisitions)
// ============================================================================

export function compute2054(balances: readonly AccountBalance[]): Form2054 {
  const immoLine = (label: string, prefixes: readonly string[]) => {
    const val = sumBalances(balances, prefixes);
    return {
      label,
      valeurDebut: ZERO(),
      augmentations: val,
      diminutions: ZERO(),
      valeurFin: val,
    };
  };

  const incorporelles = immoLine("Incorporelles", ["20"]);
  const terrains = immoLine("Terrains", ["211"]);
  const constructions = immoLine("Constructions", ["213"]);
  const materiel = immoLine("Matériel et outillage", ["215", "218"]);
  const autres = immoLine("Autres immobilisations corporelles", ["22", "23"]);
  const financieres = immoLine("Financières", ["26", "27"]);

  const totalFin = [incorporelles, terrains, constructions, materiel, autres, financieres]
    .reduce((acc, l) => add(acc, l.valeurFin), ZERO());

  return {
    _tag: "Form2054",
    incorporelles,
    corporellesTerrains: terrains,
    corporellesConstructions: constructions,
    corporellesMateriel: materiel,
    corporellesAutres: autres,
    financieres,
    totalImmobilisations: {
      label: "TOTAL",
      valeurDebut: ZERO(),
      augmentations: totalFin,
      diminutions: ZERO(),
      valeurFin: totalFin,
    },
  };
}

// ============================================================================
// 2055 — Amortissements (simplified)
// ============================================================================

export function compute2055(balances: readonly AccountBalance[]): Form2055 {
  const amortLine = (label: string, prefixes: readonly string[]) => {
    const val = negate(sumBalances(balances, prefixes));
    return {
      label,
      amortissementsDebut: ZERO(),
      augmentations: val,
      diminutions: ZERO(),
      amortissementsFin: val,
    };
  };

  const incorporelles = amortLine("Incorporelles", ["280"]);
  const constructions = amortLine("Constructions", ["2813"]);
  const materiel = amortLine("Matériel", ["2815", "2818"]);
  const autres = amortLine("Autres", ["282"]);

  const totalFin = [incorporelles, constructions, materiel, autres]
    .reduce((acc, l) => add(acc, l.amortissementsFin), ZERO());

  return {
    _tag: "Form2055",
    incorporelles,
    corporellesConstructions: constructions,
    corporellesMateriel: materiel,
    corporellesAutres: autres,
    totalAmortissements: {
      label: "TOTAL",
      amortissementsDebut: ZERO(),
      augmentations: totalFin,
      diminutions: ZERO(),
      amortissementsFin: totalFin,
    },
  };
}

// ============================================================================
// 2056 — Provisions (simplified)
// ============================================================================

export function compute2056(balances: readonly AccountBalance[]): Form2056 {
  const provLine = (label: string, prefixes: readonly string[]) => {
    const val = negate(sumBalances(balances, prefixes));
    return {
      label,
      montantDebut: ZERO(),
      dotations: val,
      reprises: ZERO(),
      montantFin: val,
    };
  };

  const risques = provLine("Provisions pour risques et charges", ["15"]);
  const immo = provLine("Dépréciations immobilisations", ["29"]);
  const stocks = provLine("Dépréciations stocks", ["39"]);
  const creances = provLine("Dépréciations créances", ["49"]);

  const totalFin = [risques, immo, stocks, creances]
    .reduce((acc, l) => add(acc, l.montantFin), ZERO());

  return {
    _tag: "Form2056",
    provisionsRisques: risques,
    provisionsDepreciationImmobilisations: immo,
    provisionsDepreciationStocks: stocks,
    provisionsDepreciationCreances: creances,
    totalProvisions: {
      label: "TOTAL",
      montantDebut: ZERO(),
      dotations: totalFin,
      reprises: ZERO(),
      montantFin: totalFin,
    },
  };
}

// ============================================================================
// 2057 — État des échéances (simplified: all < 1 year for first exercise)
// ============================================================================

export function compute2057(balances: readonly AccountBalance[]): Form2057 {
  const echeanceLine = (label: string, amount: Monetary<number>) => ({
    label,
    montantBrut: amount,
    aUnAn: amount,
    plusUnAn: ZERO(),
  });

  const creancesClients = echeanceLine("Créances clients", sumBalances(balances, ["411"]));
  const autresCreances = echeanceLine(
    "Autres créances",
    sumBalances(balances, ["40", "42", "43", "44", "45", "46"]),
  );
  const totalCreances = echeanceLine(
    "Total créances",
    add(creancesClients.montantBrut, autresCreances.montantBrut),
  );

  const emprunts = echeanceLine("Emprunts", negate(sumBalances(balances, ["16"])));
  const dettesFournisseurs = echeanceLine("Dettes fournisseurs", negate(sumBalances(balances, ["401"])));
  const dettesFiscalesSociales = echeanceLine(
    "Dettes fiscales et sociales",
    negate(sumBalances(balances, ["43", "44"])),
  );
  const autresDettes = echeanceLine("Autres dettes", negate(sumBalances(balances, ["45", "46"])));
  const totalDettes = echeanceLine(
    "Total dettes",
    [emprunts, dettesFournisseurs, dettesFiscalesSociales, autresDettes]
      .reduce((acc, l) => add(acc, l.montantBrut), ZERO()),
  );

  return {
    _tag: "Form2057",
    creances: { creancesClients, autresCreances, totalCreances },
    dettes: { emprunts, dettesFournisseurs, dettesFiscalesSociales, autresDettes, totalDettes },
  };
}

// ============================================================================
// 2058-A — Détermination du résultat fiscal
// ============================================================================

export type ReintegrationDeductionInput = {
  readonly chargesNonDeductibles?: Monetary<number>;
  readonly amortissementsExcedentaires?: Monetary<number>;
  readonly provisionsNonDeductibles?: Monetary<number>;
  readonly autresReintegrations?: Monetary<number>;
  readonly remunerationExploitant?: Monetary<number>;
  readonly produitsNonImposables?: Monetary<number>;
  readonly deficitsAnterieurs?: Monetary<number>;
  readonly autresDeductions?: Monetary<number>;
};

export function compute2058A(
  resultatComptable: Monetary<number>,
  adjustments?: ReintegrationDeductionInput,
): Form2058A {
  const adj = adjustments ?? {};

  const remunerationExploitant = adj.remunerationExploitant ?? ZERO();
  const chargesNonDeductibles = adj.chargesNonDeductibles ?? ZERO();
  const amortissementsExcedentaires = adj.amortissementsExcedentaires ?? ZERO();
  const provisionsNonDeductibles = adj.provisionsNonDeductibles ?? ZERO();
  const autresReintegrations = adj.autresReintegrations ?? ZERO();
  const totalReintegrations = [
    remunerationExploitant, chargesNonDeductibles, amortissementsExcedentaires,
    provisionsNonDeductibles, autresReintegrations,
  ].reduce((acc, v) => add(acc, v), ZERO());

  const produitsNonImposables = adj.produitsNonImposables ?? ZERO();
  const deficitsAnterieurs = adj.deficitsAnterieurs ?? ZERO();
  const autresDeductions = adj.autresDeductions ?? ZERO();
  const totalDeductions = [produitsNonImposables, deficitsAnterieurs, autresDeductions]
    .reduce((acc, v) => add(acc, v), ZERO());

  const resultatFiscal = subtract(add(resultatComptable, totalReintegrations), totalDeductions);

  // If deficit, it's reportable
  const deficitReportable = resultatFiscal.amount < 0 ? negate(resultatFiscal) : ZERO();

  return {
    _tag: "Form2058A",
    resultatComptable,
    reintegrations: {
      remunerationExploitant,
      chargesNonDeductibles,
      amortissementsExcedentaires,
      provisionsNonDeductibles,
      autresReintegrations,
      totalReintegrations,
    },
    deductions: {
      produitsNonImposables,
      deficitsAnterieurs,
      autresDeductions,
      totalDeductions,
    },
    resultatFiscal,
    deficitReportable,
  };
}

// ============================================================================
// 2059-E — Filiales et participations (empty for solo SAS)
// ============================================================================

export function compute2059E(): Form2059E {
  return { _tag: "Form2059E", participations: [] };
}

// ============================================================================
// IS computation (used by both liasse and 2572)
// ============================================================================

/** Taux IS PME: 15% up to €42,500, 25% above */
export function computeIS(resultatFiscal: Monetary<number>): Monetary<number> {
  const rf = resultatFiscal.amount; // in cents
  if (rf <= 0) return ZERO();

  const THRESHOLD_CENTS = 42500_00; // €42,500 in cents
  const RATE_REDUCED = 0.15;
  const RATE_NORMAL = 0.25;

  if (rf <= THRESHOLD_CENTS) {
    return monetary({ amount: Math.round(rf * RATE_REDUCED), currency: EUR });
  }

  const isReducedCents = Math.round(THRESHOLD_CENTS * RATE_REDUCED);
  const isNormalCents = Math.round((rf - THRESHOLD_CENTS) * RATE_NORMAL);
  return monetary({ amount: isReducedCents + isNormalCents, currency: EUR });
}

// ============================================================================
// Full Liasse Fiscale computation
// ============================================================================

export type LiasseComputationInput = {
  readonly period: FiscalPeriod;
  readonly siren: string;
  readonly denomination: string;
  readonly adresse: string;
  readonly balances: readonly AccountBalance[];
  readonly adjustments?: ReintegrationDeductionInput;
  readonly regimeImposition?: "RSI" | "RN";
  readonly effectifMoyen?: number;
};

export function computeLiasseFiscale(input: LiasseComputationInput): LiasseFiscale {
  const { period, siren, denomination, balances, adjustments } = input;

  const form2050 = compute2050(balances);
  const form2051 = compute2051(balances);
  const form2052 = compute2052(balances);
  const form2053 = compute2053(balances);
  const form2054 = compute2054(balances);
  const form2055 = compute2055(balances);
  const form2056 = compute2056(balances);
  const form2057 = compute2057(balances);

  const resultatComptable = form2053.resultat;
  const form2058A = compute2058A(resultatComptable, adjustments);
  const form2059E = compute2059E();

  const isDu = computeIS(form2058A.resultatFiscal);

  const form2065: Form2065 = {
    _tag: "Form2065",
    period,
    siren,
    denomination,
    adresse: input.adresse,
    resultatComptable,
    resultatFiscal: form2058A.resultatFiscal,
    isDu,
    chiffreAffairesHT: form2053.totalProduits,
    effectifMoyen: input.effectifMoyen ?? 0,
    regimeImposition: input.regimeImposition ?? "RSI",
  };

  return {
    _tag: "LiasseFiscale",
    period,
    siren,
    denomination,
    form2065,
    form2050,
    form2051,
    form2052,
    form2053,
    form2054,
    form2055,
    form2056,
    form2057,
    form2058A,
    form2059E,
  };
}

// ============================================================================
// Snapshot creation
// ============================================================================

export function createLiasseSnapshot(liasse: LiasseFiscale): LiasseFiscaleSnapshot {
  return {
    _tag: "LiasseFiscaleSnapshot",
    siren: liasse.siren,
    denomination: liasse.denomination,
    periodStart: liasse.period.startDate.toISOString().slice(0, 10),
    periodEnd: liasse.period.endDate.toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(liasse, (_key, value) => {
      if (value && typeof value === "object" && "amount" in value && "currency" in value) {
        return value.amount / 100;
      }
      if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
      }
      return value;
    })),
  };
}
