import { describe, expect, it } from "vitest";
import { monetary, EUR } from "@autonomynexus/monetary";
import {
  generateFecRecords,
  exportFecToString,
  validateFecRecords,
  validateSiren,
  validateCompteNum,
  generateFecFilename,
} from "../src/fec/index.js";
import type { FecGenerationInput } from "../src/fec/models.js";

const m = (cents: number) => monetary({ amount: cents, currency: EUR });
const ZERO = m(0);

const validInput: FecGenerationInput = {
  siren: "123456789",
  closingDate: new Date(2024, 11, 31),
  journalEntries: [
    {
      journalCode: "VTE",
      ecritureNum: "VTE-001",
      ecritureDate: new Date(2024, 0, 15),
      pieceRef: "FAC-001",
      pieceDate: new Date(2024, 0, 15),
      ecritureLib: "Vente",
      validDate: new Date(2024, 0, 15),
      lines: [
        { compteNum: "411", compteLib: "Clients", debit: m(12000), credit: ZERO },
        { compteNum: "706", compteLib: "Services", debit: ZERO, credit: m(10000) },
        { compteNum: "4457", compteLib: "TVA collectée", debit: ZERO, credit: m(2000) },
      ],
    },
  ],
};

describe("FEC export format", () => {
  it("produces tab-separated output", () => {
    const records = generateFecRecords(validInput);
    const exported = exportFecToString(records);
    const lines = exported.split("\n");
    // Every line should contain tabs
    for (const line of lines) {
      expect(line).toContain("\t");
    }
  });
});

describe("FEC French number formatting", () => {
  it("formats 1234.56 as 1234,56", () => {
    const records = generateFecRecords(validInput);
    const exported = exportFecToString(records);
    // The debit of 12000 cents = 120.00 → "120,00"
    expect(exported).toContain("120,00");
  });
});

describe("FEC validation", () => {
  it("detects missing mandatory fields", () => {
    const records = generateFecRecords(validInput);
    // Tamper with a record to have empty CompteLib
    const tampered = records.map((r, i) =>
      i === 0 ? { ...r, CompteLib: "" } : r,
    );
    const result = validateFecRecords(tampered);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === "MISSING_FIELD")).toBe(true);
  });

  it("detects unbalanced entry", () => {
    const unbalancedInput: FecGenerationInput = {
      ...validInput,
      journalEntries: [
        {
          ...validInput.journalEntries[0]!,
          lines: [
            { compteNum: "411", compteLib: "Clients", debit: m(12000), credit: ZERO },
            { compteNum: "706", compteLib: "Services", debit: ZERO, credit: m(10000) },
            // Missing 2000 credit → unbalanced
          ],
        },
      ],
    };
    const records = generateFecRecords(unbalancedInput);
    const result = validateFecRecords(records);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.type === "BALANCE_ERROR")).toBe(true);
  });

  it("detects wrong date format", () => {
    const records = generateFecRecords(validInput);
    const tampered = records.map((r, i) =>
      i === 0 ? { ...r, EcritureDate: "2024-01-15" } : r,
    );
    const result = validateFecRecords(tampered);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === "EcritureDate")).toBe(true);
  });

  it("validates SIREN format", () => {
    expect(validateSiren("123456789")).toBe(true);
    expect(validateSiren("12345678")).toBe(false); // too short
    expect(validateSiren("1234567890")).toBe(false); // too long
    expect(validateSiren("12345678A")).toBe(false); // non-digit
  });

  it("validates CompteNum against PCG", () => {
    expect(validateCompteNum("411")).toBe(true);
    expect(validateCompteNum("706")).toBe(true);
    expect(validateCompteNum("44566")).toBe(true);
    expect(validateCompteNum("81")).toBe(false); // too short
    expect(validateCompteNum("999")).toBe(false); // invalid class
  });

  it("detects chronological ordering violation", () => {
    const input2: FecGenerationInput = {
      ...validInput,
      journalEntries: [
        {
          journalCode: "VTE",
          ecritureNum: "VTE-002",
          ecritureDate: new Date(2024, 0, 10),
          pieceRef: "FAC-002",
          pieceDate: new Date(2024, 0, 10),
          ecritureLib: "Vente 2",
          validDate: new Date(2024, 0, 10),
          lines: [
            { compteNum: "411", compteLib: "Clients", debit: m(5000), credit: ZERO },
            { compteNum: "706", compteLib: "Services", debit: ZERO, credit: m(5000) },
          ],
        },
        ...validInput.journalEntries, // Date Jan 15 — after Jan 10, OK
      ],
    };
    // But if we reverse the order...
    const reversed: FecGenerationInput = {
      ...validInput,
      journalEntries: [
        ...validInput.journalEntries, // Jan 15
        {
          journalCode: "VTE",
          ecritureNum: "VTE-002",
          ecritureDate: new Date(2024, 0, 10), // Jan 10 — before Jan 15!
          pieceRef: "FAC-002",
          pieceDate: new Date(2024, 0, 10),
          ecritureLib: "Vente 2",
          validDate: new Date(2024, 0, 10),
          lines: [
            { compteNum: "411", compteLib: "Clients", debit: m(5000), credit: ZERO },
            { compteNum: "706", compteLib: "Services", debit: ZERO, credit: m(5000) },
          ],
        },
      ],
    };
    const records = generateFecRecords(reversed);
    const result = validateFecRecords(records);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.message.includes("chronological"))).toBe(true);
  });
});

describe("FEC filename generation", () => {
  it("follows convention {SIREN}FEC{YYYYMMDD}.txt", () => {
    const fn = generateFecFilename("987654321", new Date(2025, 5, 30));
    expect(fn).toBe("987654321FEC20250630.txt");
  });
});
