/**
 * Double-Entry Bookkeeping Engine — Core Models
 *
 * Journal types, écritures comptables, lettrage, rapprochement bancaire,
 * trial balance, general ledger, subsidiary ledger.
 */

import type { MonetaryAmount } from "../models.js";

// ============================================================================
// Journal Types
// ============================================================================

/** Standard French journal codes */
export type JournalCode = "HA" | "VE" | "BQ" | "OD" | "AN" | "SA" | "EX";

export type JournalDefinition = {
  readonly code: JournalCode | string;
  readonly name: string;
  readonly description: string;
};

export const STANDARD_JOURNALS: Record<JournalCode, JournalDefinition> = {
  HA: { code: "HA", name: "Journal des achats", description: "Écritures d'achats fournisseurs" },
  VE: { code: "VE", name: "Journal des ventes", description: "Écritures de ventes clients" },
  BQ: { code: "BQ", name: "Journal de banque", description: "Écritures bancaires" },
  OD: { code: "OD", name: "Journal des opérations diverses", description: "Écritures de régularisation, TVA, paie, etc." },
  AN: { code: "AN", name: "Journal des à-nouveaux", description: "Écritures d'ouverture de l'exercice" },
  SA: { code: "SA", name: "Journal des salaires", description: "Écritures de paie" },
  EX: { code: "EX", name: "Journal des opérations exceptionnelles", description: "Écritures exceptionnelles" },
};

// ============================================================================
// Écriture comptable (Journal Entry)
// ============================================================================

export type EcritureStatus = "BROUILLARD" | "VALIDEE" | "CLOTUREE" | "ANNULEE";

export type EcritureComptable = {
  readonly id: string;
  readonly journalCode: string;
  readonly numero: string; // Sequential numbering within journal
  readonly date: Date;
  readonly dateValidation: Date | null;
  readonly libelle: string;
  readonly pieceRef: string;
  readonly pieceDate: Date;
  readonly status: EcritureStatus;
  readonly exerciceId: string;
  readonly lignes: readonly LigneEcriture[];
};

export type LigneEcriture = {
  readonly id: string;
  readonly ecritureId: string;
  readonly compteNum: string;
  readonly compteLib: string;
  readonly compteAuxNum: string | null; // Auxiliary account (client/supplier)
  readonly compteAuxLib: string | null;
  readonly libelle: string;
  readonly debit: MonetaryAmount;
  readonly credit: MonetaryAmount;
  readonly lettrage: string | null; // Matching code
  readonly dateLettrage: Date | null;
  readonly echeance: Date | null; // Due date
};

// ============================================================================
// Lettrage (Account Matching)
// ============================================================================

export type LettrageGroup = {
  readonly code: string; // e.g. "AA", "AB", etc.
  readonly compteNum: string;
  readonly ligneIds: readonly string[];
  readonly totalDebit: MonetaryAmount;
  readonly totalCredit: MonetaryAmount;
  readonly isBalanced: boolean; // debit === credit
  readonly date: Date;
};

export type LettrageResult = {
  readonly success: boolean;
  readonly code: string | null;
  readonly error: string | null;
  readonly solde: MonetaryAmount | null; // Remaining balance if partial
};

// ============================================================================
// Rapprochement bancaire (Bank Reconciliation)
// ============================================================================

export type RapprochementStatus = "EN_COURS" | "VALIDE" | "ANNULE";

export type RapprochementBancaire = {
  readonly id: string;
  readonly compteNum: string; // Bank account (512x)
  readonly dateRapprochement: Date;
  readonly soldeComptable: MonetaryAmount;
  readonly soldeReleve: MonetaryAmount;
  readonly ecart: MonetaryAmount;
  readonly status: RapprochementStatus;
  readonly lignesRapprochees: readonly string[]; // IDs of reconciled lines
  readonly lignesNonRapprochees: readonly string[]; // IDs of unreconciled lines
};

// ============================================================================
// Balance des comptes (Trial Balance)
// ============================================================================

export type TrialBalanceLine = {
  readonly compteNum: string;
  readonly compteLib: string;
  readonly totalDebit: MonetaryAmount;
  readonly totalCredit: MonetaryAmount;
  readonly soldeDebiteur: MonetaryAmount;
  readonly soldeCrediteur: MonetaryAmount;
};

export type TrialBalance = {
  readonly exerciceId: string;
  readonly dateDebut: Date;
  readonly dateFin: Date;
  readonly generatedAt: Date;
  readonly lignes: readonly TrialBalanceLine[];
  readonly totalDebit: MonetaryAmount;
  readonly totalCredit: MonetaryAmount;
  readonly totalSoldeDebiteur: MonetaryAmount;
  readonly totalSoldeCrediteur: MonetaryAmount;
  readonly isBalanced: boolean;
};

// ============================================================================
// Grand Livre (General Ledger)
// ============================================================================

export type GrandLivreEntry = {
  readonly date: Date;
  readonly journalCode: string;
  readonly ecritureNum: string;
  readonly pieceRef: string;
  readonly libelle: string;
  readonly debit: MonetaryAmount;
  readonly credit: MonetaryAmount;
  readonly soldeProgressif: MonetaryAmount;
  readonly lettrage: string | null;
};

export type GrandLivreAccount = {
  readonly compteNum: string;
  readonly compteLib: string;
  readonly soldeOuverture: MonetaryAmount;
  readonly entries: readonly GrandLivreEntry[];
  readonly totalDebit: MonetaryAmount;
  readonly totalCredit: MonetaryAmount;
  readonly soldeCloture: MonetaryAmount;
};

export type GrandLivre = {
  readonly exerciceId: string;
  readonly dateDebut: Date;
  readonly dateFin: Date;
  readonly generatedAt: Date;
  readonly accounts: readonly GrandLivreAccount[];
};

// ============================================================================
// Balance auxiliaire (Subsidiary Ledger)
// ============================================================================

export type BalanceAuxiliaireLine = {
  readonly compteAuxNum: string;
  readonly compteAuxLib: string;
  readonly comptePrincipalNum: string; // 411 for clients, 401 for suppliers
  readonly totalDebit: MonetaryAmount;
  readonly totalCredit: MonetaryAmount;
  readonly solde: MonetaryAmount;
};

export type BalanceAuxiliaire = {
  readonly type: "CLIENTS" | "FOURNISSEURS";
  readonly exerciceId: string;
  readonly dateDebut: Date;
  readonly dateFin: Date;
  readonly generatedAt: Date;
  readonly lignes: readonly BalanceAuxiliaireLine[];
  readonly totalDebit: MonetaryAmount;
  readonly totalCredit: MonetaryAmount;
  readonly totalSolde: MonetaryAmount;
};

// ============================================================================
// Input types
// ============================================================================

export type CreateEcritureInput = {
  readonly journalCode: string;
  readonly date: Date;
  readonly libelle: string;
  readonly pieceRef: string;
  readonly pieceDate: Date;
  readonly exerciceId: string;
  readonly lignes: readonly CreateLigneInput[];
};

export type CreateLigneInput = {
  readonly compteNum: string;
  readonly compteLib?: string;
  readonly compteAuxNum?: string;
  readonly compteAuxLib?: string;
  readonly libelle?: string;
  readonly debit: MonetaryAmount;
  readonly credit: MonetaryAmount;
  readonly echeance?: Date;
};
