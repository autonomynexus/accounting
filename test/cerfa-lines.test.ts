import { describe, expect, it } from "vitest";
import { EUR, monetary } from "monetary";
import {
  CERFA_LINE_LABELS,
  type Form2050Line,
  type Form2051Line,
  type Form2052Line,
  type Form2053Line,
} from "../src/liasse-fiscale/cerfa-lines.js";
import {
  computeForm2050,
  computeForm2051,
  computeForm2052,
  computeForm2053,
  form2050ToCerfa,
  form2051ToCerfa,
  form2052ToCerfa,
  form2053ToCerfa,
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

describe("CERFA Line Labels", () => {
  it("has labels for all Form2050 lines", () => {
    const lines2050: Form2050Line[] = [
      "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL",
      "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX",
      "AY", "AZ", "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BI", "BJ",
    ];
    for (const line of lines2050) {
      expect(CERFA_LINE_LABELS[line]).toBeTruthy();
      expect(CERFA_LINE_LABELS[line].length).toBeGreaterThan(0);
    }
  });

  it("has labels for all Form2051 lines", () => {
    const lines2051: Form2051Line[] = [
      "DA", "DB", "DC", "DD", "DE", "DF", "DG", "DH", "DI", "DJ", "DK", "DL",
      "DM", "DN", "DO", "DP", "DQ", "DR", "DS", "DT", "DU", "DV", "DW", "DX",
      "DY", "DZ", "EA", "EB", "EC", "ED", "EE",
    ];
    for (const line of lines2051) {
      expect(CERFA_LINE_LABELS[line]).toBeTruthy();
      expect(CERFA_LINE_LABELS[line].length).toBeGreaterThan(0);
    }
  });

  it("has labels for all Form2052 lines", () => {
    const lines2052: Form2052Line[] = [
      "FA", "FB", "FC", "FD", "FE", "FF", "FG", "FH", "FI", "FJ", "FK", "FL",
      "FM", "FN", "FO", "FP", "FQ", "FR", "FS", "FT", "FU", "FV", "FW", "FX",
      "FY", "FZ", "GA", "GB", "GC", "GD", "GE", "GF", "GG",
    ];
    for (const line of lines2052) {
      expect(CERFA_LINE_LABELS[line]).toBeTruthy();
      expect(CERFA_LINE_LABELS[line].length).toBeGreaterThan(0);
    }
  });

  it("has labels for all Form2053 lines", () => {
    const lines2053: Form2053Line[] = [
      "HA", "HB", "HC", "HD", "HE", "HF", "HG", "HH", "HI", "HJ", "HK", "HL", "HM", "HN",
    ];
    for (const line of lines2053) {
      expect(CERFA_LINE_LABELS[line]).toBeTruthy();
      expect(CERFA_LINE_LABELS[line].length).toBeGreaterThan(0);
    }
  });

  it("all labels are non-empty French strings", () => {
    const allLabels = Object.values(CERFA_LINE_LABELS);
    expect(allLabels.length).toBeGreaterThan(100);
    for (const label of allLabels) {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(3);
    }
  });
});

describe("CERFA conversion — form2050ToCerfa", () => {
  it("maps computed 2050 to CERFA line codes", () => {
    const tb = makeTB([
      { compteNum: "205", debit: 10000, credit: 0 },
      { compteNum: "280", debit: 0, credit: 2000 },
      { compteNum: "218", debit: 50000, credit: 0 },
      { compteNum: "281", debit: 0, credit: 10000 },
      { compteNum: "411", debit: 15000, credit: 0 },
      { compteNum: "512", debit: 25000, credit: 0 },
    ]);

    const form = computeForm2050(tb);
    const cerfa = form2050ToCerfa(form);

    // Immobilisations incorporelles → AE
    expect(cerfa.AE).toBeDefined();
    expect(cerfa.AE!.brut.amount).toBe(1000000); // 10000€

    // Total actif immobilisé → AS
    expect(cerfa.AS).toBeDefined();

    // Disponibilités → BD
    expect(cerfa.BD).toBeDefined();
    expect(cerfa.BD!.brut.amount).toBe(2500000); // 25000€

    // Total général → BJ
    expect(cerfa.BJ).toBeDefined();
    expect(cerfa.BJ!.net.amount).toBeGreaterThan(0);
  });
});

describe("CERFA conversion — form2051ToCerfa", () => {
  it("maps computed 2051 to CERFA line codes", () => {
    const tb = makeTB([
      { compteNum: "101", debit: 0, credit: 10000 },
      { compteNum: "120", debit: 0, credit: 5000 },
    ]);

    const form = computeForm2051(tb);
    const cerfa = form2051ToCerfa(form);

    // Capital social → DA
    expect(cerfa.DA).toBeDefined();
    expect(cerfa.DA!.montant.amount).toBe(1000000);

    // Total passif → EE
    expect(cerfa.EE).toBeDefined();
  });
});

describe("CERFA conversion — form2052ToCerfa", () => {
  it("maps computed 2052 to CERFA line codes", () => {
    const tb = makeTB([
      { compteNum: "607", debit: 30000, credit: 0 },
      { compteNum: "641", debit: 40000, credit: 0 },
      { compteNum: "695", debit: 5000, credit: 0 },
    ]);

    const form = computeForm2052(tb);
    const cerfa = form2052ToCerfa(form);

    // Achats marchandises → FA
    expect(cerfa.FA).toBeDefined();
    expect(cerfa.FA!.montant.amount).toBe(3000000);

    // Salaires → FG
    expect(cerfa.FG).toBeDefined();
    expect(cerfa.FG!.montant.amount).toBe(4000000);

    // IS → FZ
    expect(cerfa.FZ).toBeDefined();
    expect(cerfa.FZ!.montant.amount).toBe(500000);

    // Total charges → GA
    expect(cerfa.GA).toBeDefined();
  });
});

describe("CERFA conversion — form2053ToCerfa", () => {
  it("maps computed 2053 to CERFA line codes", () => {
    const tb = makeTB([
      { compteNum: "707", debit: 0, credit: 100000 },
      { compteNum: "706", debit: 0, credit: 50000 },
    ]);

    const form = computeForm2053(tb);
    const cerfa = form2053ToCerfa(form);

    // Ventes marchandises → HA
    expect(cerfa.HA).toBeDefined();
    expect(cerfa.HA!.montant.amount).toBe(10000000);

    // Production vendue services → HC
    expect(cerfa.HC).toBeDefined();
    expect(cerfa.HC!.montant.amount).toBe(5000000);

    // Total produits → HN
    expect(cerfa.HN).toBeDefined();
  });
});
