import { describe, expect, it } from "vitest";
import { monetary, EUR } from "@autonomynexus/monetary";
import {
  generateFecRecords,
  exportFecToString,
  validateFecRecords,
  generateFecFilename,
  createFecSnapshot,
} from "../src/fec/generation.js";
import type { FecGenerationInput } from "../src/fec/models.js";

describe("FEC Generation", () => {
  const input: FecGenerationInput = {
    siren: "123456789",
    closingDate: new Date(2024, 11, 31),
    journalEntries: [
      {
        journalCode: "VTE",
        ecritureNum: "VTE-001",
        ecritureDate: new Date(2024, 0, 15),
        pieceRef: "FAC-001",
        pieceDate: new Date(2024, 0, 15),
        ecritureLib: "Vente client A",
        validDate: new Date(2024, 0, 15),
        lines: [
          {
            compteNum: "411",
            compteLib: "Clients",
            debit: monetary({amount:12000,currency:EUR}),
            credit: monetary({amount:0,currency:EUR}),
          },
          {
            compteNum: "706",
            compteLib: "Prestations de services",
            debit: monetary({amount:0,currency:EUR}),
            credit: monetary({amount:10000,currency:EUR}),
          },
          {
            compteNum: "4457",
            compteLib: "TVA collectée",
            debit: monetary({amount:0,currency:EUR}),
            credit: monetary({amount:2000,currency:EUR}),
          },
        ],
      },
    ],
  };

  it("generates FEC records", () => {
    const records = generateFecRecords(input);
    expect(records.length).toBe(3);
    expect(records[0]!.JournalCode).toBe("VTE");
    expect(records[0]!.EcritureDate).toBe("20240115");
  });

  it("exports to tab-separated string", () => {
    const records = generateFecRecords(input);
    const exported = exportFecToString(records);
    const lines = exported.split("\n");
    expect(lines[0]).toContain("JournalCode\tJournalLib");
    expect(lines.length).toBe(4); // header + 3 records
  });

  it("validates FEC records", () => {
    const records = generateFecRecords(input);
    const validation = validateFecRecords(records);
    expect(validation.valid).toBe(true);
    expect(validation.totalRecords).toBe(3);
  });

  it("generates correct filename", () => {
    const filename = generateFecFilename("123456789", new Date(2024, 11, 31));
    expect(filename).toBe("123456789FEC20241231.txt");
  });

  it("creates snapshot", () => {
    const records = generateFecRecords(input);
    const snapshot = createFecSnapshot(input, records);
    expect(snapshot._tag).toBe("FecSnapshot");
    expect(snapshot.siren).toBe("123456789");
    expect(snapshot.recordCount).toBe(3);
  });
});
