#!/usr/bin/env bun
/**
 * Generate IS Solde (2572-SD) for Autonomy Nexus — First Exercise Aug–Dec 2025
 *
 * Usage: bun scripts/an-sas-2025/generate-2572.ts
 *
 * Deadline: ~April 15, 2026
 */
import { computeIS, isPMEEligible, deriveISEligibilityFlags } from "@autonomynexus/accounting";
import { toDecimal } from "@autonomynexus/monetary";
import { COMPANY, EXERCICE, COMPANY_STRUCTURE, REVENUE, IS } from "./data.js";

// ============================================================================
// Compute PME eligibility
// ============================================================================

const pmeResult = isPMEEligible(COMPANY_STRUCTURE);
const eligibilityFlags = deriveISEligibilityFlags(COMPANY_STRUCTURE);

console.log("═══════════════════════════════════════════════════════════");
console.log("  2572-SD — Relevé de solde IS");
console.log(`  ${COMPANY.denomination} (${COMPANY.siren})`);
console.log(`  Exercice: ${EXERCICE.dateDebut.toISOString().slice(0, 10)} → ${EXERCICE.dateFin.toISOString().slice(0, 10)}`);
console.log("═══════════════════════════════════════════════════════════");

console.log("\n📋 PME Eligibility:");
console.log(`  Eligible: ${pmeResult.eligible ? "✅ YES" : "❌ NO"}`);
for (const r of pmeResult.reasons) {
  console.log(`  • ${r}`);
}

// ============================================================================
// Compute IS
// ============================================================================

const result = computeIS({
  siren: COMPANY.siren,
  denomination: COMPANY.denomination,
  exerciceDateDebut: EXERCICE.dateDebut,
  exerciceDateFin: EXERCICE.dateFin,
  dureeExerciceMois: EXERCICE.durationMonths,
  resultatFiscal: REVENUE.chiffreAffairesHT, // TODO: compute from revenue - expenses
  chiffreAffairesHT: REVENUE.chiffreAffairesHT,
  acomptesVerses: IS.acomptesVerses,
  creditsImpot: IS.creditsImpot,
  ...eligibilityFlags,
});

// ============================================================================
// Output
// ============================================================================

const fmt = (m: any) => toDecimal(m) + " €";

console.log("\n📊 IS Computation:");
console.log(`  Résultat fiscal:          ${fmt(result.resultatFiscal)}`);
console.log(`  CA HT:                    ${fmt(result.chiffreAffairesHT)}`);
console.log(`  Eligible taux réduit:     ${result.eligibleTauxReduit ? "✅" : "❌"}`);
console.log(`  IS taux réduit (15%):     ${fmt(result.isAuTauxReduit)}`);
console.log(`  IS taux normal (25%):     ${fmt(result.isAuTauxNormal)}`);
console.log(`  IS brut:                  ${fmt(result.isBrut)}`);
console.log(`  Contribution sociale:     ${fmt(result.contributionSociale)}`);
console.log(`  Total dû:                ${fmt(result.totalDu)}`);
console.log(`  Acomptes versés:          ${fmt(result.acomptesVerses)}`);
console.log(`  Crédits d'impôt:          ${fmt(result.creditsImpot)}`);
console.log(`  ─────────────────────────────────────`);
console.log(`  SOLDE À PAYER:            ${fmt(result.solde)}`);
if (toDecimal(result.excedentVersement) !== "0") {
  console.log(`  Excédent de versement:    ${fmt(result.excedentVersement)}`);
}

console.log("\n💡 With zero revenue and a loss, IS = 0. File the 2572-SD anyway to document the loss carry-forward.");
