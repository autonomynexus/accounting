import type { MonetaryAmount } from "../models.js";

// ============================================================================
// Common types
// ============================================================================

export type FiscalPeriod = {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly durationMonths: number;
  readonly isFirstExercise: boolean;
};

// ============================================================================
// 2065 — Déclaration de résultats IS
// ============================================================================

export type Form2065 = {
  readonly _tag: "Form2065";
  readonly period: FiscalPeriod;
  readonly siren: string;
  readonly denomination: string;
  readonly adresse: string;
  /** Résultat comptable (bénéfice ou perte) */
  readonly resultatComptable: MonetaryAmount;
  /** Résultat fiscal */
  readonly resultatFiscal: MonetaryAmount;
  /** IS dû */
  readonly isDu: MonetaryAmount;
  /** Chiffre d'affaires HT */
  readonly chiffreAffairesHT: MonetaryAmount;
  /** Effectif moyen */
  readonly effectifMoyen: number;
  /** Régime d'imposition */
  readonly regimeImposition: "RSI" | "RN";
};

// ============================================================================
// 2050 — Bilan Actif
// ============================================================================

export type BilanActifLine = {
  readonly label: string;
  readonly brut: MonetaryAmount;
  readonly amortissementsProvisions: MonetaryAmount;
  readonly net: MonetaryAmount;
  readonly netN1?: MonetaryAmount;
};

export type Form2050 = {
  readonly _tag: "Form2050";
  /** Immobilisations incorporelles */
  readonly immobilisationsIncorporelles: BilanActifLine;
  /** Immobilisations corporelles */
  readonly immobilisationsCorporelles: BilanActifLine;
  /** Immobilisations financières */
  readonly immobilisationsFinancieres: BilanActifLine;
  /** Total actif immobilisé */
  readonly totalActifImmobilise: BilanActifLine;
  /** Stocks et en-cours */
  readonly stocks: BilanActifLine;
  /** Créances clients */
  readonly creancesClients: BilanActifLine;
  /** Autres créances */
  readonly autresCreances: BilanActifLine;
  /** Disponibilités */
  readonly disponibilites: BilanActifLine;
  /** Charges constatées d'avance */
  readonly chargesConstatees: BilanActifLine;
  /** Total actif circulant */
  readonly totalActifCirculant: BilanActifLine;
  /** TOTAL ACTIF */
  readonly totalActif: BilanActifLine;
};

// ============================================================================
// 2051 — Bilan Passif
// ============================================================================

export type BilanPassifLine = {
  readonly label: string;
  readonly montant: MonetaryAmount;
  readonly montantN1?: MonetaryAmount;
};

export type Form2051 = {
  readonly _tag: "Form2051";
  /** Capital social */
  readonly capitalSocial: BilanPassifLine;
  /** Réserves */
  readonly reserves: BilanPassifLine;
  /** Report à nouveau */
  readonly reportANouveau: BilanPassifLine;
  /** Résultat de l'exercice */
  readonly resultatExercice: BilanPassifLine;
  /** Total capitaux propres */
  readonly totalCapitauxPropres: BilanPassifLine;
  /** Provisions pour risques et charges */
  readonly provisions: BilanPassifLine;
  /** Emprunts et dettes financières */
  readonly emprunts: BilanPassifLine;
  /** Dettes fournisseurs */
  readonly dettesFournisseurs: BilanPassifLine;
  /** Dettes fiscales et sociales */
  readonly dettesFiscalesSociales: BilanPassifLine;
  /** Autres dettes */
  readonly autresDettes: BilanPassifLine;
  /** Produits constatés d'avance */
  readonly produitsConstates: BilanPassifLine;
  /** Total dettes */
  readonly totalDettes: BilanPassifLine;
  /** TOTAL PASSIF */
  readonly totalPassif: BilanPassifLine;
};

// ============================================================================
// 2052 — Compte de Résultat (Charges)
// ============================================================================

export type Form2052 = {
  readonly _tag: "Form2052";
  /** Achats de marchandises */
  readonly achatsMarchandises: MonetaryAmount;
  /** Variation de stock marchandises */
  readonly variationStockMarchandises: MonetaryAmount;
  /** Achats matières premières */
  readonly achatsMatieresPremieres: MonetaryAmount;
  /** Variation de stock matières */
  readonly variationStockMatieres: MonetaryAmount;
  /** Autres achats et charges externes */
  readonly autresAchatsChargesExternes: MonetaryAmount;
  /** Impôts, taxes et versements assimilés */
  readonly impotsTaxes: MonetaryAmount;
  /** Salaires et traitements */
  readonly salaires: MonetaryAmount;
  /** Charges sociales */
  readonly chargesSociales: MonetaryAmount;
  /** Dotations aux amortissements et provisions */
  readonly dotationsAmortissementsProvisions: MonetaryAmount;
  /** Autres charges */
  readonly autresCharges: MonetaryAmount;
  /** Charges financières */
  readonly chargesFinancieres: MonetaryAmount;
  /** Charges exceptionnelles */
  readonly chargesExceptionnelles: MonetaryAmount;
  /** Impôt sur les bénéfices */
  readonly impotBenefices: MonetaryAmount;
  /** TOTAL DES CHARGES */
  readonly totalCharges: MonetaryAmount;
};

// ============================================================================
// 2053 — Compte de Résultat (Produits)
// ============================================================================

export type Form2053 = {
  readonly _tag: "Form2053";
  /** Ventes de marchandises */
  readonly ventesMarchandises: MonetaryAmount;
  /** Production vendue (biens) */
  readonly productionVendueBiens: MonetaryAmount;
  /** Production vendue (services) */
  readonly productionVendueServices: MonetaryAmount;
  /** Production stockée */
  readonly productionStockee: MonetaryAmount;
  /** Production immobilisée */
  readonly productionImmobilisee: MonetaryAmount;
  /** Subventions d'exploitation */
  readonly subventionsExploitation: MonetaryAmount;
  /** Reprises sur provisions */
  readonly reprisesProvisions: MonetaryAmount;
  /** Autres produits */
  readonly autresProduits: MonetaryAmount;
  /** Produits financiers */
  readonly produitsFinanciers: MonetaryAmount;
  /** Produits exceptionnels */
  readonly produitsExceptionnels: MonetaryAmount;
  /** TOTAL DES PRODUITS */
  readonly totalProduits: MonetaryAmount;
  /** Bénéfice ou perte */
  readonly resultat: MonetaryAmount;
};

// ============================================================================
// 2054 — Immobilisations
// ============================================================================

export type ImmobilisationLine = {
  readonly label: string;
  readonly valeurDebut: MonetaryAmount;
  readonly augmentations: MonetaryAmount;
  readonly diminutions: MonetaryAmount;
  readonly valeurFin: MonetaryAmount;
};

export type Form2054 = {
  readonly _tag: "Form2054";
  readonly incorporelles: ImmobilisationLine;
  readonly corporellesTerrains: ImmobilisationLine;
  readonly corporellesConstructions: ImmobilisationLine;
  readonly corporellesMateriel: ImmobilisationLine;
  readonly corporellesAutres: ImmobilisationLine;
  readonly financieres: ImmobilisationLine;
  readonly totalImmobilisations: ImmobilisationLine;
};

// ============================================================================
// 2055 — Amortissements
// ============================================================================

export type AmortissementLine = {
  readonly label: string;
  readonly amortissementsDebut: MonetaryAmount;
  readonly augmentations: MonetaryAmount;
  readonly diminutions: MonetaryAmount;
  readonly amortissementsFin: MonetaryAmount;
};

export type Form2055 = {
  readonly _tag: "Form2055";
  readonly incorporelles: AmortissementLine;
  readonly corporellesConstructions: AmortissementLine;
  readonly corporellesMateriel: AmortissementLine;
  readonly corporellesAutres: AmortissementLine;
  readonly totalAmortissements: AmortissementLine;
};

// ============================================================================
// 2056 — Provisions
// ============================================================================

export type ProvisionLine = {
  readonly label: string;
  readonly montantDebut: MonetaryAmount;
  readonly dotations: MonetaryAmount;
  readonly reprises: MonetaryAmount;
  readonly montantFin: MonetaryAmount;
};

export type Form2056 = {
  readonly _tag: "Form2056";
  readonly provisionsRisques: ProvisionLine;
  readonly provisionsDepreciationImmobilisations: ProvisionLine;
  readonly provisionsDepreciationStocks: ProvisionLine;
  readonly provisionsDepreciationCreances: ProvisionLine;
  readonly totalProvisions: ProvisionLine;
};

// ============================================================================
// 2057 — État des échéances (créances et dettes)
// ============================================================================

export type EcheanceLine = {
  readonly label: string;
  readonly montantBrut: MonetaryAmount;
  readonly aUnAn: MonetaryAmount;
  readonly plusUnAn: MonetaryAmount;
};

export type Form2057 = {
  readonly _tag: "Form2057";
  /** Créances */
  readonly creances: {
    readonly creancesClients: EcheanceLine;
    readonly autresCreances: EcheanceLine;
    readonly totalCreances: EcheanceLine;
  };
  /** Dettes */
  readonly dettes: {
    readonly emprunts: EcheanceLine;
    readonly dettesFournisseurs: EcheanceLine;
    readonly dettesFiscalesSociales: EcheanceLine;
    readonly autresDettes: EcheanceLine;
    readonly totalDettes: EcheanceLine;
  };
};

// ============================================================================
// 2058-A — Détermination du résultat fiscal
// ============================================================================

export type Form2058A = {
  readonly _tag: "Form2058A";
  /** Résultat comptable */
  readonly resultatComptable: MonetaryAmount;
  /** Réintégrations */
  readonly reintegrations: {
    /** Rémunération du travail de l'exploitant / gérant IS */
    readonly remunerationExploitant: MonetaryAmount;
    /** Charges non déductibles (amendes, pénalités, etc.) */
    readonly chargesNonDeductibles: MonetaryAmount;
    /** Amortissements excédentaires */
    readonly amortissementsExcedentaires: MonetaryAmount;
    /** Provisions non déductibles */
    readonly provisionsNonDeductibles: MonetaryAmount;
    /** Autres réintégrations */
    readonly autresReintegrations: MonetaryAmount;
    readonly totalReintegrations: MonetaryAmount;
  };
  /** Déductions */
  readonly deductions: {
    /** Produits non imposables */
    readonly produitsNonImposables: MonetaryAmount;
    /** Déduction des déficits antérieurs */
    readonly deficitsAnterieurs: MonetaryAmount;
    /** Autres déductions */
    readonly autresDeductions: MonetaryAmount;
    readonly totalDeductions: MonetaryAmount;
  };
  /** Résultat fiscal (bénéfice ou déficit) */
  readonly resultatFiscal: MonetaryAmount;
  /** Déficit de l'exercice reportable */
  readonly deficitReportable: MonetaryAmount;
};

// ============================================================================
// 2059-E — Filiales et participations
// ============================================================================

export type ParticipationLine = {
  readonly denomination: string;
  readonly siren: string;
  readonly pourcentageDetention: number;
  readonly valeurComptable: MonetaryAmount;
  readonly prixRevient: MonetaryAmount;
  readonly dividendesEncaisses: MonetaryAmount;
};

export type Form2059E = {
  readonly _tag: "Form2059E";
  readonly participations: readonly ParticipationLine[];
};

// ============================================================================
// Liasse Fiscale Complète
// ============================================================================

export type LiasseFiscale = {
  readonly _tag: "LiasseFiscale";
  readonly period: FiscalPeriod;
  readonly siren: string;
  readonly denomination: string;
  readonly form2065: Form2065;
  readonly form2050: Form2050;
  readonly form2051: Form2051;
  readonly form2052: Form2052;
  readonly form2053: Form2053;
  readonly form2054: Form2054;
  readonly form2055: Form2055;
  readonly form2056: Form2056;
  readonly form2057: Form2057;
  readonly form2058A: Form2058A;
  readonly form2059E: Form2059E;
};

// ============================================================================
// Snapshot type for JSON persistence
// ============================================================================

export type LiasseFiscaleSnapshot = {
  readonly _tag: "LiasseFiscaleSnapshot";
  readonly siren: string;
  readonly denomination: string;
  readonly periodStart: string; // ISO date
  readonly periodEnd: string; // ISO date
  readonly generatedAt: string; // ISO datetime
  /** Serialized liasse — monetary values as numbers */
  readonly data: Record<string, unknown>;
};
