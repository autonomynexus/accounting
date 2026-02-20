import { describe, expect, it } from "vitest";
import { EUR, monetary } from "@autonomynexus/monetary";
import {
  computeForm2050,
  computeForm2051,
  computeForm2052,
  computeForm2058A,
} from "../src/liasse-fiscale/computation.js";
import type { TrialBalance, TrialBalanceLine } from "../src/engine/models.js";

const m = (euros: number) => monetary({ amount: Math.round(euros * 100), currency: EUR });
const ZERO = m(0);

function makeTB(lines: Array<{ compteNum: string; debit: number; credit: number }>): TrialBalance {
  const tbLines: TrialBalanceLine[] = lines.map((l) => {
    const d = m(l.debit);
    const c = m(l.credit);
    const diff = l.debit - l.credit;
    return {
      compteNum: l.compteNum,
      compteLib: l.compteNum,
      totalDebit: d,
      totalCredit: c,
      soldeDebiteur: diff > 0 ? m(diff) : ZERO,
      soldeCrediteur: diff < 0 ? m(-diff) : ZERO,
    };
  });
  return {
    exerciceId: "2024",
    dateDebut: new Date(2024, 0, 1),
    dateFin: new Date(2024, 11, 31),
    generatedAt: new Date(),
    lignes: tbLines,
    totalDebit: ZERO,
    totalCredit: ZERO,
    totalSoldeDebiteur: ZERO,
    totalSoldeCrediteur: ZERO,
    isBalanced: true,
  };
}

describe("Form 2050 — Bilan Actif", () => {
  it("computes asset totals from trial balance", () => {
    const tb = makeTB([
      { compteNum: "205", debit: 10000, credit: 0 },
      { compteNum: "280", debit: 0, credit: 2000 },
      { compteNum: "218", debit: 50000, credit: 0 },
      { compteNum: "281", debit: 0, credit: 10000 },
      { compteNum: "411", debit: 15000, credit: 0 },
      { compteNum: "512", debit: 25000, credit: 0 },
    ]);
    const form = computeForm2050(tb);
    expect(form.immobilisationsIncorporelles.brut.amount).toBe(10000 * 100);
    expect(form.immobilisationsIncorporelles.net.amount).toBe(8000 * 100); // 10K - 2K
    expect(form.immobilisationsCorporelles.brut.amount).toBe(50000 * 100);
    expect(form.totalActif.net.amount).toBeGreaterThan(0);
  });
});

describe("Form 2051 — Bilan Passif", () => {
  it("does not double-count account 447", () => {
    const tb = makeTB([
      { compteNum: "101", debit: 0, credit: 50000 },
      { compteNum: "421", debit: 0, credit: 5000 },
      { compteNum: "431", debit: 0, credit: 3000 },
      { compteNum: "4457", debit: 0, credit: 10000 },
      { compteNum: "447", debit: 0, credit: 2000 },
    ]);
    const form = computeForm2051(tb);
    // Prefix "44" includes both 4457 (10K) and 447 (2K) = 12K
    // Plus 42 (=5K from 421) and 43 (=3K from 431) = 20K total
    expect(form.dettesFiscalesSociales.montant.amount).toBe(20000 * 100);
  });
});

describe("Form 2052 — Compte de Résultat (Charges)", () => {
  it("includes salaires 641 + rémunération exploitant 644", () => {
    const tb = makeTB([
      { compteNum: "641", debit: 30000, credit: 0 },
      { compteNum: "644", debit: 15000, credit: 0 },
    ]);
    const form = computeForm2052(tb);
    // salaires should be 641 + 644 = 45000
    expect(form.salaires.amount).toBe(45000 * 100);
  });
});

describe("Form 2058-A — Résultat fiscal", () => {
  it("computes résultat fiscal from comptable + adjustments", () => {
    const tb = makeTB([
      { compteNum: "706", debit: 0, credit: 100000 },
      { compteNum: "641", debit: 30000, credit: 0 },
      { compteNum: "606", debit: 10000, credit: 0 },
    ]);
    const form = computeForm2058A(tb, {
      remunerationExploitant: m(5000),
      chargesNonDeductibles: m(2000),
      amortissementsExcedentaires: ZERO,
      provisionsNonDeductibles: ZERO,
      autresReintegrations: ZERO,
      produitsNonImposables: ZERO,
      deficitsAnterieurs: ZERO,
      autresDeductions: ZERO,
    });
    // Résultat comptable = 100K - 30K - 10K = 60K
    expect(form.resultatComptable.amount).toBe(60000 * 100);
    // Résultat fiscal = 60K + 5K + 2K = 67K
    expect(form.resultatFiscal.amount).toBe(67000 * 100);
  });
});
