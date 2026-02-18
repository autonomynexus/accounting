import { describe, expect, it } from "vitest";
import { EUR, monetary } from "monetary";
import { compute2035A, compute2035B, compute2035 } from "../src/bnc-2035/computation.js";

const m = (euros: number) => monetary({ amount: Math.round(euros * 100), currency: EUR });
const ZERO = m(0);

describe("BNC 2035 — Résultat fiscal", () => {
  it("résultat fiscal = recettes - dépenses (no double-deduction of amortissements)", () => {
    const result = compute2035({
      recettesEncaissees: m(80000),
      cotisationsSociales: m(15000),
      fournitures: m(5000),
      siren: "123456789",
      denomination: "Dr Test",
      activite: "Médecin",
      exerciceDateDebut: new Date(2024, 0, 1),
      exerciceDateFin: new Date(2024, 11, 31),
      immobilisations: [
        {
          nature: "Matériel",
          dateAcquisition: new Date(2022, 0, 1),
          valeurOrigine: m(10000),
          dureeAmortissement: 5,
          amortissementAnnee: m(2000),
          amortissementsCumules: m(6000),
          valeurNette: m(4000),
        },
      ],
    });

    // Bénéfice = 80000 - 15000 - 5000 = 60000
    expect(result.form2035A.beneficeOuDeficit.amount).toBe(60000 * 100);
    // Résultat fiscal should equal bénéfice (NOT bénéfice - amortissements)
    expect(result.resultatFiscal.amount).toBe(60000 * 100);
    // Amortissements are reported in 2035-B but not subtracted
    expect(result.form2035B.totalAmortissementAnnee.amount).toBe(2000 * 100);
  });

  it("handles 2035-B immobilisations separately", () => {
    const form2035B = compute2035B([
      {
        nature: "Ordinateur",
        dateAcquisition: new Date(2023, 0, 1),
        valeurOrigine: m(3000),
        dureeAmortissement: 3,
        amortissementAnnee: m(1000),
        amortissementsCumules: m(2000),
        valeurNette: m(1000),
      },
    ]);
    expect(form2035B.totalValeurOrigine.amount).toBe(3000 * 100);
    expect(form2035B.totalAmortissementAnnee.amount).toBe(1000 * 100);
  });
});

describe("BNC 2035A — field name correctness", () => {
  it("uses 'fournitures' (not 'fournituress')", () => {
    const result = compute2035A({
      recettesEncaissees: m(50000),
      fournitures: m(1000),
    });
    // Access the field — TypeScript would fail at compile time if misspelled
    expect(result.fournitures.amount).toBe(1000 * 100);
  });
});
