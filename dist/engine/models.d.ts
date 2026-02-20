/**
 * Double-Entry Bookkeeping Engine — Core Models
 *
 * Journal types, écritures comptables, lettrage, rapprochement bancaire,
 * trial balance, general ledger, subsidiary ledger.
 */
import type { MonetaryAmount } from "../models.js";
/** Standard French journal codes */
export type JournalCode = "HA" | "VE" | "BQ" | "OD" | "AN" | "SA" | "EX";
export type JournalDefinition = {
    readonly code: JournalCode | string;
    readonly name: string;
    readonly description: string;
};
export declare const STANDARD_JOURNALS: Record<JournalCode, JournalDefinition>;
export type EcritureStatus = "BROUILLARD" | "VALIDEE" | "CLOTUREE" | "ANNULEE";
export type EcritureComptable = {
    readonly id: string;
    readonly journalCode: string;
    readonly numero: string;
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
    readonly compteAuxNum: string | null;
    readonly compteAuxLib: string | null;
    readonly libelle: string;
    readonly debit: MonetaryAmount;
    readonly credit: MonetaryAmount;
    readonly lettrage: string | null;
    readonly dateLettrage: Date | null;
    readonly echeance: Date | null;
};
export type LettrageGroup = {
    readonly code: string;
    readonly compteNum: string;
    readonly ligneIds: readonly string[];
    readonly totalDebit: MonetaryAmount;
    readonly totalCredit: MonetaryAmount;
    readonly isBalanced: boolean;
    readonly date: Date;
};
export type LettrageResult = {
    readonly success: boolean;
    readonly code: string | null;
    readonly error: string | null;
    readonly solde: MonetaryAmount | null;
};
export type RapprochementStatus = "EN_COURS" | "VALIDE" | "ANNULE";
export type RapprochementBancaire = {
    readonly id: string;
    readonly compteNum: string;
    readonly dateRapprochement: Date;
    readonly soldeComptable: MonetaryAmount;
    readonly soldeReleve: MonetaryAmount;
    readonly ecart: MonetaryAmount;
    readonly status: RapprochementStatus;
    readonly lignesRapprochees: readonly string[];
    readonly lignesNonRapprochees: readonly string[];
};
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
export type BalanceAuxiliaireLine = {
    readonly compteAuxNum: string;
    readonly compteAuxLib: string;
    readonly comptePrincipalNum: string;
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
//# sourceMappingURL=models.d.ts.map