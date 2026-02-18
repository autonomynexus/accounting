import type { Monetary } from "monetary";
import { add, monetary, EUR } from "monetary";
import { format } from "date-fns";
import type {
  FecRecord,
  FecGenerationInput,
  FecValidationError,
  FecValidationResult,
  FecSnapshot,
  FecRecordSerialized,
} from "./models.js";
import { FEC_HEADERS, JOURNAL_LABELS, type JournalType } from "./models.js";

// ============================================================================
// Helpers
// ============================================================================

const ZERO = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

function formatFecDate(date: Date): string {
  return format(date, "yyyyMMdd");
}

/** French number format: comma as decimal separator, 2 decimals */
function formatFrenchNumber(m: Monetary<number>): string {
  return (m.amount / 100).toFixed(2).replace(".", ",");
}

// ============================================================================
// FEC Generation
// ============================================================================

/** Generate FEC records from journal entries */
export function generateFecRecords(input: FecGenerationInput): readonly FecRecord[] {
  const records: FecRecord[] = [];

  for (const entry of input.journalEntries) {
    const journalLib =
      entry.journalLib ??
      JOURNAL_LABELS[entry.journalCode as JournalType] ??
      entry.journalCode;

    for (const line of entry.lines) {
      records.push({
        JournalCode: entry.journalCode,
        JournalLib: journalLib,
        EcritureNum: entry.ecritureNum,
        EcritureDate: formatFecDate(entry.ecritureDate),
        CompteNum: line.compteNum,
        CompteLib: line.compteLib,
        CompAuxNum: line.compAuxNum ?? "",
        CompAuxLib: line.compAuxLib ?? "",
        PieceRef: entry.pieceRef,
        PieceDate: formatFecDate(entry.pieceDate),
        EcritureLib: entry.ecritureLib,
        Debit: line.debit,
        Credit: line.credit,
        EcritureLet: line.ecritureLet ?? "",
        DateLet: line.dateLet ? formatFecDate(line.dateLet) : "",
        ValidDate: formatFecDate(entry.validDate),
        Montantdevise: line.montantdevise ?? ZERO(),
        Idevise: line.idevise ?? "EUR",
      });
    }
  }

  return records;
}

// ============================================================================
// FEC Filename
// ============================================================================

/** Generate FEC filename per convention: {SIREN}FEC{YYYYMMDD}.txt */
export function generateFecFilename(siren: string, closingDate: Date): string {
  return `${siren}FEC${formatFecDate(closingDate)}.txt`;
}

// ============================================================================
// FEC Export (tab-separated, UTF-8, French numbers)
// ============================================================================

/** Export FEC records to tab-separated string */
export function exportFecToString(records: readonly FecRecord[]): string {
  const header = FEC_HEADERS.join("\t");

  const lines = records.map((r) =>
    [
      r.JournalCode,
      r.JournalLib,
      r.EcritureNum,
      r.EcritureDate,
      r.CompteNum,
      r.CompteLib,
      r.CompAuxNum,
      r.CompAuxLib,
      r.PieceRef,
      r.PieceDate,
      r.EcritureLib,
      formatFrenchNumber(r.Debit),
      formatFrenchNumber(r.Credit),
      r.EcritureLet,
      r.DateLet,
      r.ValidDate,
      formatFrenchNumber(r.Montantdevise),
      r.Idevise,
    ].join("\t"),
  );

  return [header, ...lines].join("\n");
}

// ============================================================================
// FEC Validation
// ============================================================================

const MANDATORY_STRING_FIELDS: (keyof FecRecord)[] = [
  "JournalCode",
  "JournalLib",
  "EcritureNum",
  "EcritureDate",
  "CompteNum",
  "CompteLib",
  "PieceRef",
  "PieceDate",
  "EcritureLib",
  "ValidDate",
  "Idevise",
];

/**
 * Validate SIREN format: must be exactly 9 digits.
 */
export function validateSiren(siren: string): boolean {
  return /^\d{9}$/.test(siren);
}

/**
 * Validate CompteNum against PCG conventions:
 * Must start with a digit 1-7 and be at least 3 characters.
 */
export function validateCompteNum(compteNum: string): boolean {
  return /^[1-7]\d{2,}$/.test(compteNum);
}

/** Validate FEC records for compliance */
export function validateFecRecords(
  records: readonly FecRecord[],
  options?: { readonly siren?: string },
): FecValidationResult {
  const errors: FecValidationError[] = [];
  let totalDebit = ZERO();
  let totalCredit = ZERO();

  // SIREN format validation (9 digits)
  if (options?.siren && !validateSiren(options.siren)) {
    errors.push({
      type: "FORMAT_ERROR",
      message: `SIREN '${options.siren}' is invalid: must be exactly 9 digits`,
    });
  }

  // Group records by EcritureNum for balance check
  const entriesByNum = new Map<string, FecRecord[]>();

  // Chronological ordering check
  let previousDate = "";

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;

    // Mandatory field checks
    for (const field of MANDATORY_STRING_FIELDS) {
      const value = record[field];
      if (typeof value === "string" && value.trim() === "") {
        errors.push({
          type: "MISSING_FIELD",
          message: `Record ${i + 1}: mandatory field '${field}' is empty`,
          recordIndex: i,
          field,
        });
      }
    }

    // Date format checks (YYYYMMDD)
    for (const field of ["EcritureDate", "PieceDate", "ValidDate"] as const) {
      const value = record[field];
      if (value && !/^\d{8}$/.test(value)) {
        errors.push({
          type: "FORMAT_ERROR",
          message: `Record ${i + 1}: field '${field}' must be YYYYMMDD format, got '${value}'`,
          recordIndex: i,
          field,
        });
      }
    }

    // CompteNum validation against PCG conventions
    if (record.CompteNum && !validateCompteNum(record.CompteNum)) {
      errors.push({
        type: "FORMAT_ERROR",
        message: `Record ${i + 1}: CompteNum '${record.CompteNum}' does not conform to PCG (must start with 1-7, min 3 digits)`,
        recordIndex: i,
        field: "CompteNum",
      });
    }

    // Chronological ordering check (EcritureDate must be non-decreasing)
    if (record.EcritureDate < previousDate) {
      errors.push({
        type: "FORMAT_ERROR",
        message: `Record ${i + 1}: EcritureDate '${record.EcritureDate}' breaks chronological order (previous: '${previousDate}')`,
        recordIndex: i,
        field: "EcritureDate",
      });
    }
    previousDate = record.EcritureDate;

    totalDebit = add(totalDebit, record.Debit);
    totalCredit = add(totalCredit, record.Credit);

    // Group for balance check
    const existing = entriesByNum.get(record.EcritureNum) ?? [];
    existing.push(record);
    entriesByNum.set(record.EcritureNum, existing);
  }

  // Balance verification per entry (debit = credit)
  for (const [ecritureNum, entryRecords] of entriesByNum) {
    let entryDebit = ZERO();
    let entryCredit = ZERO();
    for (const r of entryRecords) {
      entryDebit = add(entryDebit, r.Debit);
      entryCredit = add(entryCredit, r.Credit);
    }
    if (entryDebit.amount !== entryCredit.amount) {
      errors.push({
        type: "BALANCE_ERROR",
        message: `Entry '${ecritureNum}': debit (${entryDebit.amount / 100}) ≠ credit (${entryCredit.amount / 100})`,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    totalRecords: records.length,
    totalDebit,
    totalCredit,
  };
}

// ============================================================================
// Snapshot helpers
// ============================================================================

function serializeRecord(r: FecRecord): FecRecordSerialized {
  return {
    JournalCode: r.JournalCode,
    JournalLib: r.JournalLib,
    EcritureNum: r.EcritureNum,
    EcritureDate: r.EcritureDate,
    CompteNum: r.CompteNum,
    CompteLib: r.CompteLib,
    CompAuxNum: r.CompAuxNum,
    CompAuxLib: r.CompAuxLib,
    PieceRef: r.PieceRef,
    PieceDate: r.PieceDate,
    EcritureLib: r.EcritureLib,
    Debit: r.Debit.amount / 100,
    Credit: r.Credit.amount / 100,
    EcritureLet: r.EcritureLet,
    DateLet: r.DateLet,
    ValidDate: r.ValidDate,
    Montantdevise: r.Montantdevise.amount / 100,
    Idevise: r.Idevise,
  };
}

/** Create a snapshot from FEC generation results */
export function createFecSnapshot(
  input: FecGenerationInput,
  records: readonly FecRecord[],
): FecSnapshot {
  const validation = validateFecRecords(records);
  return {
    _tag: "FecSnapshot",
    siren: input.siren,
    closingDate: input.closingDate.toISOString().slice(0, 10),
    filename: generateFecFilename(input.siren, input.closingDate),
    generatedAt: new Date().toISOString(),
    recordCount: records.length,
    totalDebit: validation.totalDebit.amount / 100,
    totalCredit: validation.totalCredit.amount / 100,
    records: records.map(serializeRecord),
  };
}
