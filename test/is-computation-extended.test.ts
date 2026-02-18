import { describe, expect, it } from "vitest";
import { EUR, monetary, compare } from "monetary";
import { computeIS, applyDeficitReportEnAvant } from "../src/is-solde/index.js";

const m = (euros: number) => monetary({ amount: Math.round(euros * 100), currency: EUR });

const baseInput = {
  acomptesVerses: m(0),
  creditsImpot: m(0),
  siren: "123456789",
  denomination: "Test SAS",
  exerciceDateDebut: new Date(2024, 0, 1),
  exerciceDateFin: new Date(2024, 11, 31),
  dureeExerciceMois: 12,
};

describe("IS PME eligibility (CGI Art. 219-I-b)", () => {
  it("qualifies for reduced rate when all 3 conditions met", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(50000),
      chiffreAffairesHT: m(500000),
      capitalEntierementLibere: true,
      detenuParPersonnesPhysiques75: true,
    });
    expect(result.eligibleTauxReduit).toBe(true);
  });

  it("does NOT qualify when capital not fully paid up", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(50000),
      chiffreAffairesHT: m(500000),
      capitalEntierementLibere: false,
      detenuParPersonnesPhysiques75: true,
    });
    expect(result.eligibleTauxReduit).toBe(false);
  });

  it("does NOT qualify when not 75% held by natural persons", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(50000),
      chiffreAffairesHT: m(500000),
      capitalEntierementLibere: true,
      detenuParPersonnesPhysiques75: false,
    });
    expect(result.eligibleTauxReduit).toBe(false);
  });

  it("does NOT qualify when CA > 10M€", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(50000),
      chiffreAffairesHT: m(15_000_000),
      capitalEntierementLibere: true,
      detenuParPersonnesPhysiques75: true,
    });
    expect(result.eligibleTauxReduit).toBe(false);
  });

  it("defaults to non-eligible when flags not provided", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(50000),
      chiffreAffairesHT: m(500000),
    });
    expect(result.eligibleTauxReduit).toBe(false);
  });
});

describe("IS €42,500 boundary", () => {
  const pmeInput = {
    ...baseInput,
    chiffreAffairesHT: m(500000),
    capitalEntierementLibere: true as const,
    detenuParPersonnesPhysiques75: true as const,
  };

  it("€42,499 — all at reduced rate", () => {
    const result = computeIS({ ...pmeInput, resultatFiscal: m(42499) });
    expect(result.eligibleTauxReduit).toBe(true);
    // All at 15%: 42499 × 0.15 = 6374.85
    expect(result.isAuTauxReduit.amount).toBeGreaterThan(0);
    expect(result.isAuTauxNormal.amount).toBe(0);
  });

  it("€42,500 — exactly at boundary", () => {
    const result = computeIS({ ...pmeInput, resultatFiscal: m(42500) });
    expect(result.eligibleTauxReduit).toBe(true);
    // 42500 × 15% = 6375, 0 at normal
    expect(result.isAuTauxReduit.amount).toBeGreaterThan(0);
    expect(result.isAuTauxNormal.amount).toBe(0);
  });

  it("€42,501 — 1€ at normal rate", () => {
    const result = computeIS({ ...pmeInput, resultatFiscal: m(42501) });
    expect(result.eligibleTauxReduit).toBe(true);
    expect(result.isAuTauxReduit.amount).toBeGreaterThan(0);
    expect(result.isAuTauxNormal.amount).toBeGreaterThan(0);
  });
});

describe("IS short fiscal year prorata", () => {
  it("5-month exercise prorates the €42,500 ceiling", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(20000),
      chiffreAffairesHT: m(100000),
      exerciceDateDebut: new Date(2024, 7, 1), // Aug 1
      exerciceDateFin: new Date(2024, 11, 31), // Dec 31
      dureeExerciceMois: 5,
      capitalEntierementLibere: true,
      detenuParPersonnesPhysiques75: true,
    });
    expect(result.eligibleTauxReduit).toBe(true);
    // Prorated ceiling: 42500 × 5/12 ≈ 17708.33
    // So 17708 at 15%, rest at 25%
    expect(result.isAuTauxReduit.amount).toBeGreaterThan(0);
    expect(result.isAuTauxNormal.amount).toBeGreaterThan(0);
  });
});

describe("IS edge cases", () => {
  it("zero profit → €0 IS", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(0),
      chiffreAffairesHT: m(100000),
    });
    expect(result.isBrut.amount).toBe(0);
    expect(result.totalDu.amount).toBe(0);
  });

  it("deficit → €0 IS", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(-50000),
      chiffreAffairesHT: m(100000),
    });
    expect(result.isBrut.amount).toBe(0);
    expect(result.totalDu.amount).toBe(0);
  });
});

describe("IS contribution sociale threshold (CGI Art. 235 ter ZC)", () => {
  it("no CSB when CA ≤ €7.63M even if IS is high", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(5_000_000),
      chiffreAffairesHT: m(7_000_000), // Below 7.63M
    });
    expect(result.contributionSociale.amount).toBe(0);
  });

  it("CSB applies when CA > €7.63M and IS > €763K", () => {
    const result = computeIS({
      ...baseInput,
      resultatFiscal: m(5_000_000),
      chiffreAffairesHT: m(10_000_000), // Above 7.63M
    });
    // IS = 5M × 25% = 1.25M > 763K → CSB applies
    expect(result.contributionSociale.amount).toBeGreaterThan(0);
  });
});

describe("Deficit carry-forward cap (€1M + 50%)", () => {
  it("full deficit used when profit ≤ €1M", () => {
    const result = applyDeficitReportEnAvant(m(500000), m(300000));
    expect(result.deficitUtilise.amount).toBe(30000000); // 300K€ fully used
    expect(result.deficitRestant.amount).toBe(0);
  });

  it("capped at €1M + 50% of excess when profit > €1M", () => {
    const result = applyDeficitReportEnAvant(m(3_000_000), m(5_000_000));
    // Plafond = 1M + 50% × 2M = 2M
    expect(compare(result.deficitUtilise, m(2_000_000))).toBe(0);
    expect(compare(result.resultatApresImputation, m(1_000_000))).toBe(0);
    expect(compare(result.deficitRestant, m(3_000_000))).toBe(0);
  });
});
