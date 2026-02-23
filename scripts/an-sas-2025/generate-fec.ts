#!/usr/bin/env bun
/**
 * Generate FEC (Fichier des Écritures Comptables) for Autonomy Nexus — First Exercise
 *
 * Usage: bun scripts/an-sas-2025/generate-fec.ts
 *
 * The FEC is mandatory for all companies subject to IS.
 * Filename convention: {SIREN}FEC{YYYYMMDD}.txt
 * Output: 943173864FEC20251231.txt
 */
import { generateFEC, type FECEntry } from "@autonomynexus/accounting";
import { toDecimal, monetary, EUR } from "@autonomynexus/monetary";
import { COMPANY, EXERCICE, EXPENSES, BANK } from "./data.js";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";

const ZERO = monetary({ amount: 0, currency: EUR });

// ============================================================================
// Build FEC entries from expenses + capital
// ============================================================================

function buildFECEntries(): FECEntry[] {
  const entries: FECEntry[] = [];
  let sequence = 1;

  // Opening entry: capital deposit
  entries.push({
    JournalCode: "AN",
    JournalLib: "À-nouveau",
    EcritureNum: String(sequence),
    EcritureDate: EXERCICE.dateDebut,
    CompteNum: "512000",
    CompteLib: "Banque",
    CompAuxNum: "",
    CompAuxLib: "",
    PieceRef: "AN-001",
    PieceDate: EXERCICE.dateDebut,
    EcritureLib: "Apport en capital - dépôt",
    Debit: BANK.apportCapital,
    Credit: ZERO,
    EcritureLet: "",
    DateLet: undefined,
    ValidDate: EXERCICE.dateDebut,
    Montantdevise: undefined,
    Idevise: undefined,
  });

  entries.push({
    JournalCode: "AN",
    JournalLib: "À-nouveau",
    EcritureNum: String(sequence),
    EcritureDate: EXERCICE.dateDebut,
    CompteNum: "101000",
    CompteLib: "Capital social",
    CompAuxNum: "",
    CompAuxLib: "",
    PieceRef: "AN-001",
    PieceDate: EXERCICE.dateDebut,
    EcritureLib: "Apport en capital",
    Debit: ZERO,
    Credit: BANK.apportCapital,
    EcritureLet: "",
    DateLet: undefined,
    ValidDate: EXERCICE.dateDebut,
    Montantdevise: undefined,
    Idevise: undefined,
  });
  sequence++;

  // Expense entries
  for (const expense of EXPENSES) {
    // Debit expense account
    entries.push({
      JournalCode: "HA",
      JournalLib: "Achats",
      EcritureNum: String(sequence),
      EcritureDate: expense.date,
      CompteNum: expense.accountCode,
      CompteLib: expense.label,
      CompAuxNum: "",
      CompAuxLib: "",
      PieceRef: `HA-${String(sequence).padStart(3, "0")}`,
      PieceDate: expense.date,
      EcritureLib: expense.description,
      Debit: expense.amountHT,
      Credit: ZERO,
      EcritureLet: "",
      DateLet: undefined,
      ValidDate: expense.date,
      Montantdevise: undefined,
      Idevise: undefined,
    });

    // Debit TVA deductible
    if (toDecimal(expense.amountTVA) !== "0") {
      entries.push({
        JournalCode: "HA",
        JournalLib: "Achats",
        EcritureNum: String(sequence),
        EcritureDate: expense.date,
        CompteNum: "445660",
        CompteLib: "TVA déductible sur ABS",
        CompAuxNum: "",
        CompAuxLib: "",
        PieceRef: `HA-${String(sequence).padStart(3, "0")}`,
        PieceDate: expense.date,
        EcritureLib: `TVA - ${expense.description}`,
        Debit: expense.amountTVA,
        Credit: ZERO,
        EcritureLet: "",
        DateLet: undefined,
        ValidDate: expense.date,
        Montantdevise: undefined,
        Idevise: undefined,
      });
    }

    // Credit bank
    entries.push({
      JournalCode: "HA",
      JournalLib: "Achats",
      EcritureNum: String(sequence),
      EcritureDate: expense.date,
      CompteNum: "512000",
      CompteLib: "Banque",
      CompAuxNum: "",
      CompAuxLib: "",
      PieceRef: `HA-${String(sequence).padStart(3, "0")}`,
      PieceDate: expense.date,
      EcritureLib: expense.description,
      Debit: ZERO,
      Credit: monetary({ amount: Number(toDecimal(expense.amountHT)) * 100 + Number(toDecimal(expense.amountTVA)) * 100, currency: EUR }), // TTC
      EcritureLet: "",
      DateLet: undefined,
      ValidDate: expense.date,
      Montantdevise: undefined,
      Idevise: undefined,
    });

    sequence++;
  }

  return entries;
}

// ============================================================================
// Generate
// ============================================================================

const entries = buildFECEntries();
const dateCloture = EXERCICE.dateFin.toISOString().slice(0, 10).replace(/-/g, "");
const filename = `${COMPANY.siren}FEC${dateCloture}.txt`;
const outputDir = dirname(new URL(import.meta.url).pathname);

console.log("═══════════════════════════════════════════════════════════");
console.log("  FEC — Fichier des Écritures Comptables");
console.log(`  ${COMPANY.denomination} (${COMPANY.siren})`);
console.log(`  Exercice: ${EXERCICE.dateDebut.toISOString().slice(0, 10)} → ${EXERCICE.dateFin.toISOString().slice(0, 10)}`);
console.log("═══════════════════════════════════════════════════════════");
console.log(`\n  📊 ${entries.length} lignes d'écriture`);
console.log(`  📁 Output: ${filename}`);

try {
  const fecContent = generateFEC(entries);
  const outputPath = join(outputDir, filename);
  writeFileSync(outputPath, fecContent, "utf-8");
  console.log(`\n  ✅ FEC generated: ${outputPath}`);
  console.log(`     Size: ${fecContent.length} bytes`);
} catch (e) {
  console.error("\n  ❌ FEC generation failed:", e);
  console.log("\n  💡 Fill in EXPENSES in data.ts first.");
}

console.log("\n  💡 The FEC must be kept for 6 years (Art. L102 B du LPF).");
console.log("     Store it alongside your liasse fiscale submission.");
