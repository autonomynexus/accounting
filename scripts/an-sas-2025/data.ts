/**
 * Autonomy Nexus SAS — First Exercise (Aug 1 – Dec 31, 2025)
 *
 * Fill in your actual figures here. All amounts in EUR cents (use monetary()).
 * This file is the single source of truth for generating all filings.
 */
import { EUR, monetary, type Monetary } from "monetary";
import type { CompanyStructure, Shareholder } from "@autonomynexus/accounting";

// ============================================================================
// Company Identity
// ============================================================================

export const COMPANY = {
  siren: "943173864",
  denomination: "Autonomy Nexus",
  formeJuridique: "SAS" as const,
  adresse: "231 Rue Saint-Honoré, 75001 Paris",
  activite: "Édition de logiciels applicatifs (5829C)",
  regimeImposition: "RSI" as const, // Régime Simplifié d'Imposition
  dateCreation: new Date("2025-08-01"),
} as const;

// ============================================================================
// Fiscal Period
// ============================================================================

export const EXERCICE = {
  dateDebut: new Date("2025-08-01"),
  dateFin: new Date("2025-12-31"),
  durationMonths: 5,
  isFirstExercise: true,
} as const;

// ============================================================================
// Company Structure (for PME eligibility)
// ============================================================================

const shareholders: readonly Shareholder[] = [
  {
    name: "Kevin Courbet",
    type: "natural_person",
    sharePercentage: 100,
  },
];

export const COMPANY_STRUCTURE: CompanyStructure = {
  capitalSocial: monetary({ amount: 500_000, currency: EUR }), // €5,000
  capitalLibere: monetary({ amount: 500_000, currency: EUR }), // fully paid up
  shareholders,
  effectifMoyen: 1, // solo founder
  totalBilan: monetary({ amount: 0, currency: EUR }), // TODO: fill after closing
  chiffreAffairesHT: monetary({ amount: 0, currency: EUR }), // zero revenue
};

// ============================================================================
// Revenue (zero for first exercise)
// ============================================================================

export const REVENUE = {
  chiffreAffairesHT: monetary({ amount: 0, currency: EUR }),
  autresProduits: monetary({ amount: 0, currency: EUR }),
};

// ============================================================================
// Expenses — Fill these in with actual figures
// ============================================================================

// TODO: Fill in actual expenses for Aug–Dec 2025
// Each entry: { label, accountCode (PCG), amountHT, amountTVA }
export const EXPENSES: Array<{
  label: string;
  accountCode: string; // PCG account
  date: Date;
  amountHT: Monetary<number>; // HT in cents
  amountTVA: Monetary<number>; // TVA amount
  description: string;
}> = [
  // Example entries (replace with actuals):
  // {
  //   label: "Domiciliation",
  //   accountCode: "6132", // Locations immobilières
  //   date: new Date("2025-08-01"),
  //   amountHT: monetary({ amount: 50_00, currency: EUR }),
  //   amountTVA: monetary({ amount: 10_00, currency: EUR }),
  //   description: "Domiciliation commerciale mensuelle",
  // },
  // {
  //   label: "Frais de constitution",
  //   accountCode: "6227", // Frais d'actes et de contentieux
  //   date: new Date("2025-08-01"),
  //   amountHT: monetary({ amount: 300_00, currency: EUR }),
  //   amountTVA: monetary({ amount: 60_00, currency: EUR }),
  //   description: "Greffe, annonce légale, etc.",
  // },
];

// ============================================================================
// Bank / Treasury
// ============================================================================

export const BANK = {
  /** Bank balance at Dec 31, 2025 */
  soldeAuCloture: monetary({ amount: 0, currency: EUR }), // TODO: fill in
  /** Capital deposit */
  apportCapital: monetary({ amount: 500_000, currency: EUR }), // €5,000
};

// ============================================================================
// TVA — Acomptes already paid in 2025
// ============================================================================

export const TVA = {
  /** TVA collected on sales (should be 0) */
  tvaCollectee: monetary({ amount: 0, currency: EUR }),
  /** TVA deductible on purchases */
  tvaDeductible: monetary({ amount: 0, currency: EUR }), // TODO: sum from expenses
  /** Acomptes TVA already paid */
  acomptesVerses: monetary({ amount: 0, currency: EUR }),
  /** Credit from previous period */
  creditAnterieur: monetary({ amount: 0, currency: EUR }),
};

// ============================================================================
// IS — Acomptes (all exempt for first exercise with IS < €3,000)
// ============================================================================

export const IS = {
  acomptesVerses: monetary({ amount: 0, currency: EUR }), // none — exempt
  creditsImpot: monetary({ amount: 0, currency: EUR }),
};
