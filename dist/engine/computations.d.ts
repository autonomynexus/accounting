/**
 * Double-Entry Bookkeeping Engine — Pure Computations
 *
 * Trial balance, general ledger, subsidiary ledger computation
 * from journal entries. Pure functions, no side effects.
 */
import type { MonetaryAmount } from "../models.js";
import type { EcritureComptable, LigneEcriture, TrialBalance, GrandLivre, BalanceAuxiliaire, LettrageResult, CreateEcritureInput } from "./models.js";
export type EcritureValidationError = {
    readonly type: "NO_LINES" | "UNBALANCED" | "ZERO_AMOUNT" | "INVALID_LINE" | "INVALID_ACCOUNT";
    readonly message: string;
};
/** Validate an écriture comptable (debit = credit, at least 2 lines, etc.) */
export declare function validateEcriture(input: CreateEcritureInput): readonly EcritureValidationError[];
/** Compute trial balance from journal entries */
export declare function computeTrialBalance(ecritures: readonly EcritureComptable[], exerciceId: string, dateDebut: Date, dateFin: Date): TrialBalance;
/** Compute general ledger from journal entries */
export declare function computeGrandLivre(ecritures: readonly EcritureComptable[], exerciceId: string, dateDebut: Date, dateFin: Date): GrandLivre;
/** Compute subsidiary ledger for clients or suppliers */
export declare function computeBalanceAuxiliaire(ecritures: readonly EcritureComptable[], type: "CLIENTS" | "FOURNISSEURS", exerciceId: string, dateDebut: Date, dateFin: Date): BalanceAuxiliaire;
/** Check if a set of lines can be lettered (balanced) */
export declare function computeLettrage(lignes: readonly LigneEcriture[], code: string): LettrageResult;
export type ClotureResult = {
    readonly ecrituresCloture: readonly CreateEcritureInput[];
    readonly resultat: MonetaryAmount;
};
/**
 * Generate year-end closing entries.
 * Closes all Class 6 and Class 7 accounts to account 12 (Résultat).
 */
export declare function computeClotureExercice(trialBalance: TrialBalance, exerciceId: string, dateCloture: Date): ClotureResult;
/**
 * Generate opening entries for next exercise from closing trial balance.
 * Takes balance sheet accounts (classes 1-5) and creates opening entries.
 */
export declare function computeANouveau(trialBalance: TrialBalance, newExerciceId: string, dateOuverture: Date): CreateEcritureInput;
/** Get balance for a specific account from trial balance */
export declare function getAccountBalance(trialBalance: TrialBalance, compteNum: string): MonetaryAmount;
/** Get sum of balances for all accounts starting with prefix */
export declare function getAccountPrefixBalance(trialBalance: TrialBalance, prefix: string): MonetaryAmount;
/** Get sum of debit balances for accounts starting with prefix */
export declare function getDebitBalance(trialBalance: TrialBalance, prefix: string): MonetaryAmount;
/** Get sum of credit balances for accounts starting with prefix */
export declare function getCreditBalance(trialBalance: TrialBalance, prefix: string): MonetaryAmount;
//# sourceMappingURL=computations.d.ts.map