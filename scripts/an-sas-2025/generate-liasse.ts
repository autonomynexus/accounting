#!/usr/bin/env bun
/**
 * Generate Liasse Fiscale (2065 + 2050-2059) for Autonomy Nexus — First Exercise
 *
 * Usage: bun scripts/an-sas-2025/generate-liasse.ts
 *
 * Deadline: ~May 5, 2026
 * Output: CERFA line codes → values for each form
 */
import {
  type Form2050,
  type Form2051,
  type Form2052,
  type Form2053,
  form2050ToCerfa,
  form2051ToCerfa,
  form2052ToCerfa,
  form2053ToCerfa,
  CERFA_LINE_LABELS,
} from "@autonomynexus/accounting";
import { toDecimal, monetary, EUR } from "@autonomynexus/monetary";
import { COMPANY, EXERCICE, REVENUE, BANK, EXPENSES } from "./data.js";

const ZERO = monetary({ amount: 0, currency: EUR });
const zeroLine = { brut: ZERO, amortissementsProvisions: ZERO, net: ZERO };

// ============================================================================
// Build Form 2050 — Bilan Actif
// ============================================================================

// For first exercise with zero revenue, most lines are zero.
// The main non-zero items: bank balance (512) and possibly setup costs (201)
const form2050: Form2050 = {
  _tag: "Form2050",
  immobilisationsIncorporelles: zeroLine,
  immobilisationsCorporelles: zeroLine,
  immobilisationsFinancieres: zeroLine,
  totalActifImmobilise: zeroLine,
  stocksEtEnCours: zeroLine,
  avancesEtAcomptes: zeroLine,
  creancesClients: zeroLine,
  autresCreances: zeroLine,
  disponibilites: { brut: BANK.soldeAuCloture, amortissementsProvisions: ZERO, net: BANK.soldeAuCloture },
  chargesConstatees: zeroLine,
  totalActifCirculant: { brut: BANK.soldeAuCloture, amortissementsProvisions: ZERO, net: BANK.soldeAuCloture },
  totalActif: { brut: BANK.soldeAuCloture, amortissementsProvisions: ZERO, net: BANK.soldeAuCloture },
};

// ============================================================================
// Build Form 2051 — Bilan Passif
// ============================================================================

const form2051: Form2051 = {
  _tag: "Form2051",
  capitalSocial: COMPANY.formeJuridique === "SAS" ? monetary({ amount: 500_000, currency: EUR }) : ZERO,
  reserveLegale: ZERO,
  reservesStatutaires: ZERO,
  autresReserves: ZERO,
  reportANouveau: ZERO,
  resultatExercice: ZERO, // TODO: compute from revenue - expenses (will be negative = loss)
  totalCapitauxPropres: monetary({ amount: 500_000, currency: EUR }), // TODO: capital - loss
  provisions: ZERO,
  emprunts: ZERO,
  fournisseurs: ZERO,
  dettesFiscalesSociales: ZERO,
  autresDettes: ZERO,
  totalDettes: ZERO,
  totalPassif: monetary({ amount: 500_000, currency: EUR }), // TODO: must equal totalActif
};

// ============================================================================
// Output helpers
// ============================================================================

function printCerfaTable(title: string, formNumber: string, cerfaRecord: Record<string, any>) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${formNumber} — ${title}`);
  console.log(`${"═".repeat(60)}`);

  for (const [code, value] of Object.entries(cerfaRecord)) {
    const label = CERFA_LINE_LABELS[code as keyof typeof CERFA_LINE_LABELS] ?? "";
    if (typeof value === "object" && "brut" in value) {
      // BilanActif-style line
      const brut = toDecimal(value.brut);
      const amort = toDecimal(value.amortissementsProvisions);
      const net = toDecimal(value.net);
      if (brut !== "0" || net !== "0") {
        console.log(`  ${code}  ${label.padEnd(35)} Brut: ${brut.padStart(10)} | Amort: ${amort.padStart(10)} | Net: ${net.padStart(10)}`);
      }
    } else if (typeof value === "object" && "montant" in value) {
      const montant = toDecimal(value.montant);
      if (montant !== "0") {
        console.log(`  ${code}  ${label.padEnd(35)} ${montant.padStart(10)} €`);
      }
    }
  }
  console.log("  (lines with zero values omitted)");
}

// ============================================================================
// Generate CERFA output
// ============================================================================

console.log("═══════════════════════════════════════════════════════════");
console.log("  LIASSE FISCALE — Autonomy Nexus SAS");
console.log(`  SIREN: ${COMPANY.siren}`);
console.log(`  Exercice: ${EXERCICE.dateDebut.toISOString().slice(0, 10)} → ${EXERCICE.dateFin.toISOString().slice(0, 10)} (${EXERCICE.durationMonths} mois)`);
console.log("═══════════════════════════════════════════════════════════");

try {
  const cerfa2050 = form2050ToCerfa(form2050);
  printCerfaTable("Bilan Actif", "2050", cerfa2050);
} catch (e) {
  console.log("\n⚠️  2050 generation skipped (fill in data.ts first)");
}

try {
  const cerfa2051 = form2051ToCerfa(form2051);
  printCerfaTable("Bilan Passif", "2051", cerfa2051);
} catch (e) {
  console.log("\n⚠️  2051 generation skipped (fill in data.ts first)");
}

// 2052/2053 need the full Form types — skip for now until expenses are entered
console.log("\n📝 2052 (Charges) and 2053 (Produits) — fill in EXPENSES in data.ts first");
console.log("\n💡 For first exercise with zero revenue, most lines will be zero.");
console.log("   Key items: capital social, bank balance, setup expenses as loss.");
