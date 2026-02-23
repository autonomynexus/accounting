#!/usr/bin/env bun
/**
 * Generate CA12 (Annual TVA Declaration) for Autonomy Nexus — First Exercise
 *
 * Usage: bun scripts/an-sas-2025/generate-ca12.ts
 *
 * Deadline: ~May 5, 2026
 * Form: 3517-S-SD (CERFA 11417)
 */
import { Effect, Layer } from "effect";
import {
  Ca12GeneratorService,
  Ca12GeneratorServiceLayer,
  JournalDataPort,
  type JournalLineModel,
  type Period,
} from "@autonomynexus/accounting";
import { monetary, EUR, toDecimal } from "@autonomynexus/monetary";
import { COMPANY, EXERCICE, TVA } from "./data.js";

// ============================================================================
// Bespoke journal data (no DB needed)
// ============================================================================

// For zero-revenue first exercise, the journal lines are minimal.
// TODO: populate with actual journal entries when expenses are entered
const journalLines: JournalLineModel[] = [];

const BespokeJournalLayer = Layer.succeed(JournalDataPort, {
  getJournalLines: (_userId: string, _period: Period) =>
    Effect.succeed(journalLines),
});

// ============================================================================
// Generate CA12
// ============================================================================

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  CA12 (3517-S-SD) — Déclaration annuelle de TVA");
  console.log(`  ${COMPANY.denomination} (${COMPANY.siren})`);
  console.log(`  Période: ${EXERCICE.dateDebut.toISOString().slice(0, 10)} → ${EXERCICE.dateFin.toISOString().slice(0, 10)}`);
  console.log("═══════════════════════════════════════════════════════════");

  const program = Effect.gen(function* () {
    const ca12 = yield* Ca12GeneratorService;
    const result = yield* ca12.generate({
      userId: "an-sas",
      period: {
        startDate: EXERCICE.dateDebut,
        endDate: EXERCICE.dateFin,
      },
      acomptesVerses: TVA.acomptesVerses,
      creditAnterieur: TVA.creditAnterieur,
    });
    return result;
  });

  const runnable = program.pipe(
    Effect.provide(Ca12GeneratorServiceLayer),
    Effect.provide(BespokeJournalLayer),
  );

  const result = await Effect.runPromise(runnable).catch((e) => {
    console.error("\n❌ CA12 generation failed:", e);
    console.log("\n💡 Fill in journal entries in data.ts to generate the CA12.");
    console.log("   For zero-revenue exercise, TVA collected = 0.");
    console.log("   TVA deductible on setup expenses = credit to carry forward.");
    return null;
  });

  if (!result) return;

  const fmt = (m: any) => toDecimal(m) + " €";

  console.log("\n📊 CA12 Results:");
  console.log(`  TVA collectée (ventes):   ${fmt(result.tvaCollectee)}`);
  console.log(`  TVA déductible (achats):  ${fmt(result.tvaDeductible)}`);
  console.log(`  TVA nette:                ${fmt(result.tvaNette)}`);
  console.log(`  Acomptes versés:          ${fmt(result.acomptesVerses)}`);
  console.log(`  Crédit antérieur:         ${fmt(result.creditAnterieur)}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  SOLDE:                    ${fmt(result.solde)}`);

  if (result.creditTva) {
    console.log(`\n  💰 Crédit de TVA à reporter: ${fmt(result.creditTva)}`);
    console.log("     → Demande de remboursement possible ou report sur CA12 suivante");
  }
}

main();
