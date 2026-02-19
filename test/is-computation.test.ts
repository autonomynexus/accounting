import { describe, expect, it } from "vitest";
import { EUR, monetary } from "monetary";
import { computeIS, computeAcomptes, computeAcompteDates, applyDeficitReportEnAvant } from "../src/is-solde/index.js";

const m = (euros: number) => monetary({ amount: euros * 100, currency: EUR });

describe("IS Computation", () => {
  it("computes IS with taux réduit (small company)", () => {
    const result = computeIS({
      resultatFiscal: m(50000),
      chiffreAffairesHT: m(500000),
      acomptesVerses: m(0),
      creditsImpot: m(0),
      siren: "123456789",
      denomination: "Test SAS",
      exerciceDateDebut: new Date(2024, 0, 1),
      exerciceDateFin: new Date(2024, 11, 31),
      dureeExerciceMois: 12,
      capitalEntierementLibere: true,
      detenuParPersonnesPhysiques75: true,
    });

    expect(result.eligibleTauxReduit).toBe(true);
    expect(result.isBrut.amount).toBeGreaterThan(0);
    expect(result.contributionSociale.amount).toBe(0);
  });

  it("computes IS without taux réduit (large CA)", () => {
    const result = computeIS({
      resultatFiscal: m(100000),
      chiffreAffairesHT: m(15_000_000),
      acomptesVerses: m(0),
      creditsImpot: m(0),
      siren: "123456789",
      denomination: "Test SAS",
      exerciceDateDebut: new Date(2024, 0, 1),
      exerciceDateFin: new Date(2024, 11, 31),
      dureeExerciceMois: 12,
    });

    expect(result.eligibleTauxReduit).toBe(false);
    expect(result.isAuTauxReduit.amount).toBe(0);
  });

  it("handles loss (no IS due)", () => {
    const result = computeIS({
      resultatFiscal: m(-10000),
      chiffreAffairesHT: m(100000),
      acomptesVerses: m(5000),
      creditsImpot: m(0),
      siren: "123456789",
      denomination: "Test SAS",
      exerciceDateDebut: new Date(2024, 0, 1),
      exerciceDateFin: new Date(2024, 11, 31),
      dureeExerciceMois: 12,
    });

    expect(result.isBrut.amount).toBe(0);
    expect(result.excedentVersement.amount).toBe(500000);
  });

  it("computes acomptes from previous year IS (calendar year)", () => {
    const acomptes = computeAcomptes(m(20000), new Date(2025, 0, 1), new Date(2025, 11, 31));
    expect(acomptes).toHaveLength(4);
    for (const a of acomptes) {
      expect(a.montant.amount).toBeGreaterThan(0);
    }
    // Calendar year: Mar 15, Jun 15, Sep 15, Dec 15
    expect(acomptes[0].dateEcheance).toEqual(new Date(2025, 2, 15));
    expect(acomptes[1].dateEcheance).toEqual(new Date(2025, 5, 15));
    expect(acomptes[2].dateEcheance).toEqual(new Date(2025, 8, 15));
    expect(acomptes[3].dateEcheance).toEqual(new Date(2025, 11, 15));
  });

  it("returns zero acomptes for first exercise", () => {
    const acomptes = computeAcomptes(m(0), new Date(2025, 0, 1), new Date(2025, 11, 31));
    for (const a of acomptes) {
      expect(a.montant.amount).toBe(0);
    }
  });
});

describe("computeAcompteDates", () => {
  it("standard calendar year (Jan-Dec) produces 4 dates", () => {
    const dates = computeAcompteDates(new Date(2025, 0, 1), new Date(2025, 11, 31));
    expect(dates).toHaveLength(4);
    // Per BOI-IS-DECLA-20-10-10: 15th of 3rd, 6th, 9th, 12th month
    expect(dates[0]).toEqual(new Date(2025, 2, 15)); // Mar 15
    expect(dates[1]).toEqual(new Date(2025, 5, 15)); // Jun 15
    expect(dates[2]).toEqual(new Date(2025, 8, 15)); // Sep 15
    expect(dates[3]).toEqual(new Date(2025, 11, 15)); // Dec 15
  });

  it("short first exercise Aug-Dec produces fewer acomptes", () => {
    // AN SAS first exercise: Aug 1 to Dec 31
    const dates = computeAcompteDates(new Date(2025, 7, 1), new Date(2025, 11, 31));
    // Acompte 1: month 7+2=9 (Oct) → Oct 15 ✓
    // Acompte 2: month 7+5=12 (Jan) → Jan 15 ✗ (after Dec 31)
    expect(dates).toHaveLength(1);
    expect(dates[0]).toEqual(new Date(2025, 9, 15)); // Oct 15
  });

  it("Apr-Mar fiscal year produces 4 dates", () => {
    const dates = computeAcompteDates(new Date(2025, 3, 1), new Date(2026, 2, 31));
    expect(dates).toHaveLength(4);
    // 3rd month (Jun), 6th (Sep), 9th (Dec), 12th (Mar)
    expect(dates[0]).toEqual(new Date(2025, 5, 15)); // Jun 15
    expect(dates[1]).toEqual(new Date(2025, 8, 15)); // Sep 15
    expect(dates[2]).toEqual(new Date(2025, 11, 15)); // Dec 15
    expect(dates[3]).toEqual(new Date(2026, 2, 15)); // Mar 15
  });

  it("very short exercise (3 months, Oct-Dec) produces 1 acompte", () => {
    const dates = computeAcompteDates(new Date(2025, 9, 1), new Date(2025, 11, 31));
    // Acompte 1: month 9+2=11 (Dec) → Dec 15 ✓
    // Acompte 2: month 9+5=14 (Mar next year) → beyond Dec 31
    expect(dates).toHaveLength(1);
    expect(dates[0]).toEqual(new Date(2025, 11, 15)); // Dec 15
  });

  it("2-month exercise produces 0 acomptes", () => {
    const dates = computeAcompteDates(new Date(2025, 10, 1), new Date(2025, 11, 31));
    // Acompte 1: month 10+2=12 (Jan) → Jan 15 > Dec 31
    expect(dates).toHaveLength(0);
  });
});

describe("Deficit carry-forward", () => {
  it("applies deficit to current year profit", () => {
    const result = applyDeficitReportEnAvant(m(100000), m(30000));
    expect(result.deficitUtilise.amount).toBe(3000000);
    expect(result.deficitRestant.amount).toBe(0);
  });

  it("caps deficit at 1M + 50% above 1M", () => {
    const result = applyDeficitReportEnAvant(m(3_000_000), m(5_000_000));
    expect(result.deficitUtilise.amount).toBeGreaterThan(0);
    expect(result.deficitRestant.amount).toBeGreaterThan(0);
    expect(result.resultatApresImputation.amount).toBeGreaterThan(0);
  });
});
