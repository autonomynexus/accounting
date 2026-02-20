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
import type { AccountClass, AccountTypeCode } from "../models.js";
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
    /** PCG article defining this account (e.g. "941-10") */
    readonly pcgArticle: string | null;
};
/** Complete PCG chart of accounts — all standard accounts Classes 1-8
 *  per Règlement ANC N° 2014-03, Livre III, Chapitre III */
export declare const PCG_ACCOUNTS_FULL: readonly PcgAccountDefinition[];
/** Get account definition by code */
export declare function getAccountByCode(code: string): PcgAccountDefinition | undefined;
/** Get all accounts for a given class */
export declare function getAccountsByClass(cls: AccountClass): readonly PcgAccountDefinition[];
/** Get all child accounts of a parent */
export declare function getChildAccounts(parentCode: string): readonly PcgAccountDefinition[];
/** Get all accounts whose code starts with a prefix */
export declare function getAccountsByPrefix(prefix: string): readonly PcgAccountDefinition[];
/** Get the full hierarchy path for an account (from root down to account) */
export declare function getAccountHierarchy(code: string): readonly PcgAccountDefinition[];
/** Check if an account code exists in the PCG */
export declare function isValidPcgAccount(code: string): boolean;
/** Get all leaf accounts (accounts with no children) */
export declare function getLeafAccounts(): readonly PcgAccountDefinition[];
/** Get all accounts of a specific type */
export declare function getAccountsByType(typeId: AccountTypeCode): readonly PcgAccountDefinition[];
//# sourceMappingURL=chart-of-accounts-full.d.ts.map