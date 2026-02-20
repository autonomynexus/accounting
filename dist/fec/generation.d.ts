import type { FecRecord, FecGenerationInput, FecValidationResult, FecSnapshot } from "./models.js";
/** Generate FEC records from journal entries */
export declare function generateFecRecords(input: FecGenerationInput): readonly FecRecord[];
/** Generate FEC filename per convention: {SIREN}FEC{YYYYMMDD}.txt */
export declare function generateFecFilename(siren: string, closingDate: Date): string;
/** Export FEC records to tab-separated string */
export declare function exportFecToString(records: readonly FecRecord[]): string;
/**
 * Validate SIREN format: must be exactly 9 digits.
 */
export declare function validateSiren(siren: string): boolean;
/**
 * Validate CompteNum against PCG conventions:
 * Must start with a digit 1-7 and be at least 3 characters.
 */
export declare function validateCompteNum(compteNum: string): boolean;
/** Validate FEC records for compliance */
export declare function validateFecRecords(records: readonly FecRecord[], options?: {
    readonly siren?: string;
}): FecValidationResult;
/** Create a snapshot from FEC generation results */
export declare function createFecSnapshot(input: FecGenerationInput, records: readonly FecRecord[]): FecSnapshot;
//# sourceMappingURL=generation.d.ts.map