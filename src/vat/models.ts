import type { VatCode } from "./utils.js";
import type { Monetary } from "@autonomynexus/monetary";
import type { UserId } from "../models.js";
import type { Period } from "../models.js";

/**
 * French VAT regime types
 */
export type VatRegime =
  | "franchise" // Franchise en base - no VAT
  | "reel_simplifie" // Régime simplifié - annual CA12
  | "reel_normal"; // Régime normal - monthly/quarterly CA3

/**
 * VAT declaration frequency
 */
export type VatDeclarationFrequency = "monthly" | "quarterly" | "annual";

/**
 * Input for computing VAT declaration
 */
export type ComputeVatDeclarationInput = {
  readonly userId: UserId;
  readonly period: Period;
  readonly regime: VatRegime;
};

/**
 * VAT amounts by rate
 */
export type VatByRate = {
  readonly code: VatCode;
  readonly collected: Monetary<number>; // From 4457
  readonly deductible: Monetary<number>; // From 4456
  readonly net: Monetary<number>; // collected - deductible
};

/**
 * VAT totals breakdown
 */
export type VatTotals = {
  readonly totalCollected: Monetary<number>; // Sum of all 4457 lines
  readonly totalDeductible: Monetary<number>; // Sum of all 4456 lines
  readonly netVat: Monetary<number>; // Total to pay (positive) or credit (negative)
};

/**
 * Complete VAT declaration result
 */
export type VatDeclarationResult = {
  readonly period: Period;
  readonly regime: VatRegime;
  readonly byRate: readonly VatByRate[]; // Breakdown by VAT rate
  readonly totals: VatTotals;
  readonly isCredit: boolean; // True if netVat < 0 (VAT credit)
};

/**
 * CA3 TVA line with base HT and calculated TVA
 * Used for lignes 08-11 which require both base and tax amount
 */
export type Ca3TvaLine = {
  readonly base: Monetary<number>; // Base HT (taxable amount)
  readonly tva: Monetary<number>; // Calculated TVA
};

/**
 * CA3 declaration (monthly/quarterly for régime réel normal)
 * Official form: 3310-CA3-SD (CERFA 10963)
 * Legal basis: CGI Art. 287
 *
 * All 32 lines included. Lines without data source default to zero.
 * @see docs/vat-declaration-ca3.md for complete documentation
 */
export type Ca3Declaration = {
  // ============================================================================
  // CADRE A - Montant des opérations réalisées (HT)
  // ============================================================================

  // Opérations imposables
  readonly ligne01: Monetary<number>; // Ventes, prestations de services
  readonly ligne02: Monetary<number>; // Autres opérations imposables
  readonly ligne03: Monetary<number>; // Acquisitions intracommunautaires (AIC)
  readonly ligne3A: Monetary<number>; // Livraisons gaz/électricité taxables en France
  readonly ligne3B: Monetary<number>; // Achats biens/services assujetti non établi (art. 283 CGI)

  // Opérations non imposables
  readonly ligne04: Monetary<number>; // Exportations hors UE
  readonly ligne05: Monetary<number>; // Autres opérations non imposables
  readonly ligne06: Monetary<number>; // Livraisons intracommunautaires (LIC)
  readonly ligne6A: Monetary<number>; // Gaz/électricité non imposables en France
  readonly ligne07: Monetary<number>; // Achats en franchise

  // ============================================================================
  // CADRE B - Décompte de la TVA à payer
  // ============================================================================

  // TVA brute par taux (base HT + TVA calculée)
  readonly ligne08: Ca3TvaLine; // Taux normal 20%
  readonly ligne09: Ca3TvaLine; // Taux réduit 5.5%
  readonly ligne9B: Ca3TvaLine; // Taux intermédiaire 10%
  readonly ligne10: Ca3TvaLine; // Taux DOM 8.5%
  readonly ligne11: Ca3TvaLine; // Taux super-réduit 2.1%
  readonly ligne13: Monetary<number>; // Anciens taux
  readonly ligne14: Monetary<number>; // Opérations imposables à taux particulier
  readonly ligne15: Monetary<number>; // TVA antérieurement déduite à reverser

  readonly ligne16: Monetary<number>; // TOTAL TVA BRUTE (calculé: sum 08-15)

  // TVA sur opérations spécifiques
  readonly ligne17: Monetary<number>; // TVA sur acquisitions intracommunautaires
  readonly ligne18: Monetary<number>; // TVA sur opérations à Monaco

  // ============================================================================
  // CADRE D - TVA déductible
  // ============================================================================

  readonly ligne19: Monetary<number>; // Biens constituant des immobilisations (44562)
  readonly ligne20: Monetary<number>; // Autres biens et services (44566)
  readonly ligne21: Monetary<number>; // Autre TVA à déduire
  readonly ligne22: Monetary<number>; // Report crédit de la déclaration précédente

  readonly ligne23: Monetary<number>; // TOTAL TVA DÉDUCTIBLE (calculé: sum 19-22)

  // ============================================================================
  // CADRE E - TVA nette / Crédit
  // ============================================================================

  readonly ligne25: Monetary<number>; // Crédit de TVA (si ligne23 > ligne16)
  readonly ligne26: Monetary<number>; // Remboursement demandé (form 3519)
  readonly ligne27: Monetary<number>; // Crédit à reporter sur prochaine déclaration

  readonly ligne28: Monetary<number>; // TVA NETTE DUE (si ligne16 > ligne23)

  // ============================================================================
  // CADRE F - Taxes assimilées et total
  // ============================================================================

  readonly ligne29: Monetary<number>; // Taxes assimilées (annexe 3310-A)
  readonly ligne30: Monetary<number>; // Sommes à imputer (trop-versé)
  readonly ligne31: Monetary<number>; // Sommes à ajouter (insuffisance)

  readonly ligne32: Monetary<number>; // TOTAL À PAYER (calculé)
};

/**
 * Input for generating CA3 declaration
 */
export type GenerateCa3Input = {
  readonly userId: UserId;
  readonly period: Period;
  readonly previousCredit?: Monetary<number>; // ligne 22 - credit from previous declaration
};

/**
 * JSON-serializable version of Ca3Declaration for storage
 * Amounts stored as cents (number) instead of Monetary objects
 */
export type Ca3DeclarationSnapshot = {
  readonly version: string; // Schema version for future migrations
  readonly generatedAt: string; // ISO timestamp
  readonly periodStart: string; // ISO date
  readonly periodEnd: string; // ISO date

  // All lines as cents (number)
  readonly ligne01: number;
  readonly ligne02: number;
  readonly ligne03: number;
  readonly ligne3A: number;
  readonly ligne3B: number;
  readonly ligne04: number;
  readonly ligne05: number;
  readonly ligne06: number;
  readonly ligne6A: number;
  readonly ligne07: number;

  readonly ligne08_base: number;
  readonly ligne08_tva: number;
  readonly ligne09_base: number;
  readonly ligne09_tva: number;
  readonly ligne9B_base: number;
  readonly ligne9B_tva: number;
  readonly ligne10_base: number;
  readonly ligne10_tva: number;
  readonly ligne11_base: number;
  readonly ligne11_tva: number;
  readonly ligne13: number;
  readonly ligne14: number;
  readonly ligne15: number;
  readonly ligne16: number;
  readonly ligne17: number;
  readonly ligne18: number;

  readonly ligne19: number;
  readonly ligne20: number;
  readonly ligne21: number;
  readonly ligne22: number;
  readonly ligne23: number;

  readonly ligne25: number;
  readonly ligne26: number;
  readonly ligne27: number;
  readonly ligne28: number;

  readonly ligne29: number;
  readonly ligne30: number;
  readonly ligne31: number;
  readonly ligne32: number;
};

/**
 * CA12 TVA line with base HT and calculated TVA (same as CA3)
 * Used for lines 5A-5C which require both base and tax amount
 */
export type Ca12TvaLine = {
  readonly base: Monetary<number>; // Base HT (taxable amount)
  readonly tva: Monetary<number>; // Calculated TVA
};

/**
 * CA12 declaration (annual for régime simplifié)
 * Official form: 3517-S-SD (CERFA 11417)
 * Legal basis: CGI Art. 302 septies A
 *
 * Simplified annual declaration for régime réel simplifié.
 * @see docs/vat-declaration-ca3.md for related documentation
 */
export type Ca12Declaration = {
  // ============================================================================
  // Exercice (fiscal year)
  // ============================================================================
  readonly exerciceStart: Date;
  readonly exerciceEnd: Date;

  // ============================================================================
  // CADRE I - Opérations réalisées
  // ============================================================================

  // Opérations non taxées
  readonly ligne01: Monetary<number>; // Achats en franchise
  readonly ligne02: Monetary<number>; // Exportations hors CE
  readonly ligne03: Monetary<number>; // Autres opérations non imposables
  readonly ligne3A: Monetary<number>; // Ventes à distance seuil dépassé
  readonly ligne04: Monetary<number>; // Livraisons intracommunautaires

  // Opérations imposables (base HT + TVA)
  readonly ligne5A: Ca12TvaLine; // Taux normal 20%
  readonly ligne5B: Ca12TvaLine; // Taux réduit 5.5%
  readonly ligne5C: Ca12TvaLine; // Taux intermédiaire 10%
  readonly ligne06: Ca12TvaLine; // Taux DOM 8.5%
  readonly ligne07: Ca12TvaLine; // Taux super-réduit 2.1%
  readonly ligne08: Ca12TvaLine; // Taux particuliers
  readonly ligne09: Ca12TvaLine; // Anciens taux
  readonly ligne10: Monetary<number>; // Opérations particulières

  readonly ligneAA: Monetary<number>; // Ventes biens non établis
  readonly ligneAB: Monetary<number>; // Livraisons/prestations autoliquidées
  readonly ligneAC: Monetary<number>; // Acquisitions intracommunautaires services
  readonly ligne11: Monetary<number>; // Cessions d'immobilisations
  readonly ligne12: Monetary<number>; // Livraisons à soi-même

  // ============================================================================
  // CADRE II - TVA brute et déductible
  // ============================================================================

  readonly ligne19: Monetary<number>; // TOTAL TVA BRUTE DUE

  // TVA déductible
  readonly ligne20: Monetary<number>; // TVA déductible sur factures (ABS)
  readonly ligne21: Monetary<number>; // Déduction forfaitaire 0.2% (option)
  readonly ligne22: Monetary<number>; // Total déductions (20 + 21)
  readonly ligne23: Monetary<number>; // TVA déductible sur immobilisations
  readonly ligne24: Monetary<number>; // Report crédit année précédente

  readonly ligne25: Monetary<number>; // TOTAL TVA DÉDUCTIBLE

  // Coefficient (for partial deduction - rare for freelancers)
  readonly ligne26: Monetary<number>; // Coefficient de déduction
  readonly ligne27: Monetary<number>; // Total TVA déductible après coefficient

  // ============================================================================
  // CADRE III - TVA nette
  // ============================================================================

  readonly ligne28: Monetary<number>; // TVA NETTE DUE (si ligne19 > ligne27)
  readonly ligne29: Monetary<number>; // CRÉDIT DE TVA (si ligne27 > ligne19)

  readonly ligne30: Monetary<number>; // Acomptes versés (juillet + décembre)
  readonly ligne31: Monetary<number>; // Sommes à imputer
  readonly ligne32: Monetary<number>; // Sommes à ajouter

  readonly ligne33: Monetary<number>; // TOTAL À PAYER ou
  readonly ligne34: Monetary<number>; // CRÉDIT À REPORTER

  // ============================================================================
  // Acomptes detail (for tracking)
  // ============================================================================

  readonly acompteJuillet: Monetary<number>; // 55% acompte payé en juillet
  readonly acompteDécembre: Monetary<number>; // 40% acompte payé en décembre
  readonly baseAcomptesSuivants: Monetary<number>; // Base for next year's acomptes
};

/**
 * Input for generating CA12 declaration
 */
export type GenerateCa12Input = {
  readonly userId: UserId;
  readonly exercice: {
    readonly startDate: Date;
    readonly endDate: Date;
  };
  readonly previousCredit?: Monetary<number>; // ligne 24 - credit from previous year
  readonly acompteJuillet?: Monetary<number>; // July advance payment
  readonly acompteDécembre?: Monetary<number>; // December advance payment
};

/**
 * JSON-serializable version of Ca12Declaration for storage
 */
export type Ca12DeclarationSnapshot = {
  readonly version: string;
  readonly generatedAt: string;
  readonly exerciceStart: string;
  readonly exerciceEnd: string;

  // Non-taxed operations
  readonly ligne01: number;
  readonly ligne02: number;
  readonly ligne03: number;
  readonly ligne3A: number;
  readonly ligne04: number;

  // Taxed operations (base + tva)
  readonly ligne5A_base: number;
  readonly ligne5A_tva: number;
  readonly ligne5B_base: number;
  readonly ligne5B_tva: number;
  readonly ligne5C_base: number;
  readonly ligne5C_tva: number;
  readonly ligne06_base: number;
  readonly ligne06_tva: number;
  readonly ligne07_base: number;
  readonly ligne07_tva: number;
  readonly ligne08_base: number;
  readonly ligne08_tva: number;
  readonly ligne09_base: number;
  readonly ligne09_tva: number;
  readonly ligne10: number;

  readonly ligneAA: number;
  readonly ligneAB: number;
  readonly ligneAC: number;
  readonly ligne11: number;
  readonly ligne12: number;

  // TVA brute and deductible
  readonly ligne19: number;
  readonly ligne20: number;
  readonly ligne21: number;
  readonly ligne22: number;
  readonly ligne23: number;
  readonly ligne24: number;
  readonly ligne25: number;
  readonly ligne26: number;
  readonly ligne27: number;

  // Net
  readonly ligne28: number;
  readonly ligne29: number;
  readonly ligne30: number;
  readonly ligne31: number;
  readonly ligne32: number;
  readonly ligne33: number;
  readonly ligne34: number;

  // Acomptes
  readonly acompteJuillet: number;
  readonly acompteDécembre: number;
  readonly baseAcomptesSuivants: number;
};

// ============================================================================
// Snapshot Conversion Helpers
// ============================================================================

/**
 * Convert Ca3Declaration to storable snapshot
 */
export function toCA3Snapshot(ca3: Ca3Declaration, period: Period): Ca3DeclarationSnapshot {
  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    periodStart: period.startDate.toISOString(),
    periodEnd: period.endDate.toISOString(),

    ligne01: ca3.ligne01.amount,
    ligne02: ca3.ligne02.amount,
    ligne03: ca3.ligne03.amount,
    ligne3A: ca3.ligne3A.amount,
    ligne3B: ca3.ligne3B.amount,
    ligne04: ca3.ligne04.amount,
    ligne05: ca3.ligne05.amount,
    ligne06: ca3.ligne06.amount,
    ligne6A: ca3.ligne6A.amount,
    ligne07: ca3.ligne07.amount,

    ligne08_base: ca3.ligne08.base.amount,
    ligne08_tva: ca3.ligne08.tva.amount,
    ligne09_base: ca3.ligne09.base.amount,
    ligne09_tva: ca3.ligne09.tva.amount,
    ligne9B_base: ca3.ligne9B.base.amount,
    ligne9B_tva: ca3.ligne9B.tva.amount,
    ligne10_base: ca3.ligne10.base.amount,
    ligne10_tva: ca3.ligne10.tva.amount,
    ligne11_base: ca3.ligne11.base.amount,
    ligne11_tva: ca3.ligne11.tva.amount,
    ligne13: ca3.ligne13.amount,
    ligne14: ca3.ligne14.amount,
    ligne15: ca3.ligne15.amount,
    ligne16: ca3.ligne16.amount,
    ligne17: ca3.ligne17.amount,
    ligne18: ca3.ligne18.amount,

    ligne19: ca3.ligne19.amount,
    ligne20: ca3.ligne20.amount,
    ligne21: ca3.ligne21.amount,
    ligne22: ca3.ligne22.amount,
    ligne23: ca3.ligne23.amount,

    ligne25: ca3.ligne25.amount,
    ligne26: ca3.ligne26.amount,
    ligne27: ca3.ligne27.amount,
    ligne28: ca3.ligne28.amount,

    ligne29: ca3.ligne29.amount,
    ligne30: ca3.ligne30.amount,
    ligne31: ca3.ligne31.amount,
    ligne32: ca3.ligne32.amount,
  };
}

/**
 * Convert Ca12Declaration to storable snapshot
 */
export function toCA12Snapshot(ca12: Ca12Declaration): Ca12DeclarationSnapshot {
  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    exerciceStart: ca12.exerciceStart.toISOString(),
    exerciceEnd: ca12.exerciceEnd.toISOString(),

    ligne01: ca12.ligne01.amount,
    ligne02: ca12.ligne02.amount,
    ligne03: ca12.ligne03.amount,
    ligne3A: ca12.ligne3A.amount,
    ligne04: ca12.ligne04.amount,

    ligne5A_base: ca12.ligne5A.base.amount,
    ligne5A_tva: ca12.ligne5A.tva.amount,
    ligne5B_base: ca12.ligne5B.base.amount,
    ligne5B_tva: ca12.ligne5B.tva.amount,
    ligne5C_base: ca12.ligne5C.base.amount,
    ligne5C_tva: ca12.ligne5C.tva.amount,
    ligne06_base: ca12.ligne06.base.amount,
    ligne06_tva: ca12.ligne06.tva.amount,
    ligne07_base: ca12.ligne07.base.amount,
    ligne07_tva: ca12.ligne07.tva.amount,
    ligne08_base: ca12.ligne08.base.amount,
    ligne08_tva: ca12.ligne08.tva.amount,
    ligne09_base: ca12.ligne09.base.amount,
    ligne09_tva: ca12.ligne09.tva.amount,
    ligne10: ca12.ligne10.amount,

    ligneAA: ca12.ligneAA.amount,
    ligneAB: ca12.ligneAB.amount,
    ligneAC: ca12.ligneAC.amount,
    ligne11: ca12.ligne11.amount,
    ligne12: ca12.ligne12.amount,

    ligne19: ca12.ligne19.amount,
    ligne20: ca12.ligne20.amount,
    ligne21: ca12.ligne21.amount,
    ligne22: ca12.ligne22.amount,
    ligne23: ca12.ligne23.amount,
    ligne24: ca12.ligne24.amount,
    ligne25: ca12.ligne25.amount,
    ligne26: ca12.ligne26.amount,
    ligne27: ca12.ligne27.amount,

    ligne28: ca12.ligne28.amount,
    ligne29: ca12.ligne29.amount,
    ligne30: ca12.ligne30.amount,
    ligne31: ca12.ligne31.amount,
    ligne32: ca12.ligne32.amount,
    ligne33: ca12.ligne33.amount,
    ligne34: ca12.ligne34.amount,

    acompteJuillet: ca12.acompteJuillet.amount,
    acompteDécembre: ca12.acompteDécembre.amount,
    baseAcomptesSuivants: ca12.baseAcomptesSuivants.amount,
  };
}

// ============================================================================
// Extended CA3 Declaration with Annexes
// ============================================================================

import type { ADeclaration } from "./annexe-a-models.js";
import type { TerDeclaration } from "./ter-models.js";
import type { TicDeclaration } from "./tic-models.js";

/**
 * Complete CA3 declaration with all annexes
 * Extends basic CA3 with TER, A, and TIC annexes
 */
export type Ca3DeclarationFull = Ca3Declaration & {
  readonly hasTer: boolean; // Has 3310-TER annexe (multi-sector)
  readonly hasAnnexeA: boolean; // Has 3310-A annexe (assimilated taxes)
  readonly hasTic: boolean; // Has 3310-TIC annexe (energy excise)
  readonly ter: TerDeclaration | null;
  readonly annexeA: ADeclaration | null;
  readonly tic: TicDeclaration | null;
};

/**
 * Check if CA3 declaration includes annexes
 */
export function hasAnyAnnexe(declaration: Ca3DeclarationFull): boolean {
  return declaration.hasTer || declaration.hasAnnexeA || declaration.hasTic;
}

/**
 * Create CA3DeclarationFull from basic CA3 (no annexes)
 */
export function toFullDeclaration(ca3: Ca3Declaration): Ca3DeclarationFull {
  return {
    ...ca3,
    hasTer: false,
    hasAnnexeA: false,
    hasTic: false,
    ter: null,
    annexeA: null,
    tic: null,
  };
}
