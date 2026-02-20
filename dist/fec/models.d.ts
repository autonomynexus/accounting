import type { MonetaryAmount } from "../models.js";
export type FecRecord = {
    /** Code journal de l'écriture comptable */
    readonly JournalCode: string;
    /** Libellé journal de l'écriture comptable */
    readonly JournalLib: string;
    /** Numéro sur une séquence continue de l'écriture comptable */
    readonly EcritureNum: string;
    /** Date de comptabilisation de l'écriture comptable (YYYYMMDD) */
    readonly EcritureDate: string;
    /** Numéro de compte (PCG) */
    readonly CompteNum: string;
    /** Libellé de compte */
    readonly CompteLib: string;
    /** Numéro de compte auxiliaire (peut être vide) */
    readonly CompAuxNum: string;
    /** Libellé de compte auxiliaire (peut être vide) */
    readonly CompAuxLib: string;
    /** Référence de la pièce justificative */
    readonly PieceRef: string;
    /** Date de la pièce justificative (YYYYMMDD) */
    readonly PieceDate: string;
    /** Libellé de l'écriture comptable */
    readonly EcritureLib: string;
    /** Montant au débit */
    readonly Debit: MonetaryAmount;
    /** Montant au crédit */
    readonly Credit: MonetaryAmount;
    /** Lettrage de l'écriture comptable */
    readonly EcritureLet: string;
    /** Date de lettrage */
    readonly DateLet: string;
    /** Date de validation de l'écriture comptable (YYYYMMDD) */
    readonly ValidDate: string;
    /** Montant en devise (0 si EUR) */
    readonly Montantdevise: MonetaryAmount;
    /** Identifiant de la devise (EUR par défaut) */
    readonly Idevise: string;
};
/** FEC header row field names in order */
export declare const FEC_HEADERS: readonly ["JournalCode", "JournalLib", "EcritureNum", "EcritureDate", "CompteNum", "CompteLib", "CompAuxNum", "CompAuxLib", "PieceRef", "PieceDate", "EcritureLib", "Debit", "Credit", "EcritureLet", "DateLet", "ValidDate", "Montantdevise", "Idevise"];
/** Journal code mapping for common journal types */
export type JournalType = "ACH" | "VTE" | "BQ" | "OD" | "AN";
export declare const JOURNAL_LABELS: Record<JournalType, string>;
export type FecValidationError = {
    readonly type: "MISSING_FIELD" | "BALANCE_ERROR" | "FORMAT_ERROR";
    readonly message: string;
    readonly recordIndex?: number;
    readonly field?: string;
};
export type FecValidationResult = {
    readonly valid: boolean;
    readonly errors: readonly FecValidationError[];
    readonly totalRecords: number;
    readonly totalDebit: MonetaryAmount;
    readonly totalCredit: MonetaryAmount;
};
export type FecGenerationInput = {
    readonly siren: string;
    readonly closingDate: Date;
    readonly journalEntries: readonly FecJournalEntry[];
};
export type FecJournalEntry = {
    readonly journalCode: JournalType | string;
    readonly journalLib?: string;
    readonly ecritureNum: string;
    readonly ecritureDate: Date;
    readonly pieceRef: string;
    readonly pieceDate: Date;
    readonly ecritureLib: string;
    readonly validDate: Date;
    readonly lines: readonly FecJournalLine[];
};
export type FecJournalLine = {
    readonly compteNum: string;
    readonly compteLib: string;
    readonly compAuxNum?: string;
    readonly compAuxLib?: string;
    readonly debit: MonetaryAmount;
    readonly credit: MonetaryAmount;
    readonly ecritureLet?: string;
    readonly dateLet?: Date;
    readonly montantdevise?: MonetaryAmount;
    readonly idevise?: string;
};
export type FecSnapshot = {
    readonly _tag: "FecSnapshot";
    readonly siren: string;
    readonly closingDate: string;
    readonly filename: string;
    readonly generatedAt: string;
    readonly recordCount: number;
    readonly totalDebit: number;
    readonly totalCredit: number;
    readonly records: readonly FecRecordSerialized[];
};
/** Serialized FEC record with numbers as plain numbers */
export type FecRecordSerialized = {
    readonly [K in keyof FecRecord]: FecRecord[K] extends MonetaryAmount ? number : FecRecord[K];
};
//# sourceMappingURL=models.d.ts.map