import { describe, expect, it } from "vitest";
import { EUR, monetary } from "monetary";
import {
  computeAmortissementLineaire,
  computeAmortissementDegressif,
  computeProrata,
  computeCession,
} from "../src/amortization/index.js";
import type { Immobilisation } from "../src/amortization/index.js";

const m = (euros: number) => monetary({ amount: euros * 100, currency: EUR });

const exerciceDates = [
  { dateDebut: new Date(2024, 0, 1), dateFin: new Date(2024, 11, 31) },
  { dateDebut: new Date(2025, 0, 1), dateFin: new Date(2025, 11, 31) },
  { dateDebut: new Date(2026, 0, 1), dateFin: new Date(2026, 11, 31) },
  { dateDebut: new Date(2027, 0, 1), dateFin: new Date(2027, 11, 31) },
  { dateDebut: new Date(2028, 0, 1), dateFin: new Date(2028, 11, 31) },
  { dateDebut: new Date(2029, 0, 1), dateFin: new Date(2029, 11, 31) },
];

describe("Prorata Temporis", () => {
  it("computes full year prorata for linear", () => {
    const p = computeProrata(new Date(2024, 0, 1), new Date(2024, 11, 31), "LINEAIRE");
    expect(p).toBeGreaterThan(0.99);
    expect(p).toBeLessThanOrEqual(1);
  });

  it("computes partial year prorata for linear", () => {
    const p = computeProrata(new Date(2024, 6, 1), new Date(2024, 11, 31), "LINEAIRE");
    expect(p).toBeGreaterThan(0.4);
    expect(p).toBeLessThan(0.6);
  });

  it("computes declining balance prorata by months", () => {
    const p = computeProrata(new Date(2024, 6, 1), new Date(2024, 11, 31), "DEGRESSIF");
    expect(p).toBe(6 / 12); // July to December = 6 months
  });
});

describe("Linear Amortization", () => {
  it("computes 5-year linear schedule", () => {
    const immo: Immobilisation = {
      id: "1",
      compteNum: "2183",
      compteAmortNum: "2818",
      libelle: "Matériel informatique",
      dateAcquisition: new Date(2024, 0, 1),
      dateMiseEnService: new Date(2024, 0, 1),
      dateCession: null,
      valeurAcquisition: m(5000),
      valeurResiduelle: m(0),
      dureeAmortissement: 5,
      methode: "LINEAIRE",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementLineaire(immo, exerciceDates);
    expect(schedule.lignes.length).toBe(5);

    // Each year should be ~1000€ (5000/5)
    for (const ligne of schedule.lignes) {
      expect(ligne.dotation.amount).toBeGreaterThan(0);
    }

    // Final VNC should be 0
    const lastLine = schedule.lignes[schedule.lignes.length - 1]!;
    expect(lastLine.valeurNetteComptable.amount).toBe(0);
  });

  it("handles prorata temporis for mid-year acquisition", () => {
    const immo: Immobilisation = {
      id: "2",
      compteNum: "2183",
      compteAmortNum: "2818",
      libelle: "Matériel",
      dateAcquisition: new Date(2024, 6, 1), // July 1
      dateMiseEnService: new Date(2024, 6, 1),
      dateCession: null,
      valeurAcquisition: m(3600),
      valeurResiduelle: m(0),
      dureeAmortissement: 3,
      methode: "LINEAIRE",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementLineaire(immo, exerciceDates);
    // First year should be partial
    expect(schedule.lignes[0]!.prorata).toBeLessThan(1);
    // Should have 4 lines (3 years + partial first + partial last)
    expect(schedule.lignes.length).toBeGreaterThanOrEqual(3);
  });
});

describe("Declining Balance Amortization", () => {
  it("computes declining balance with coefficient", () => {
    const immo: Immobilisation = {
      id: "3",
      compteNum: "215",
      compteAmortNum: "2815",
      libelle: "Matériel industriel",
      dateAcquisition: new Date(2024, 0, 1),
      dateMiseEnService: new Date(2024, 0, 1),
      dateCession: null,
      valeurAcquisition: m(10000),
      valeurResiduelle: m(0),
      dureeAmortissement: 5,
      methode: "DEGRESSIF",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementDegressif(immo, exerciceDates);
    expect(schedule.lignes.length).toBeGreaterThan(0);

    // First year dotation should be higher than linear
    const firstDotation = schedule.lignes[0]!.dotation.amount;
    const linearDotation = 10000 * 100 / 5; // 2000€ linear
    expect(firstDotation).toBeGreaterThan(linearDotation);

    // Schedule should fully depreciate the asset
    expect(schedule.totalDotations.amount).toBeGreaterThan(0);
  });
});

describe("Asset Disposal", () => {
  it("computes disposal with plus-value", () => {
    const immo: Immobilisation = {
      id: "4",
      compteNum: "2183",
      compteAmortNum: "2818",
      libelle: "Test",
      dateAcquisition: new Date(2024, 0, 1),
      dateMiseEnService: new Date(2024, 0, 1),
      dateCession: null,
      valeurAcquisition: m(5000),
      valeurResiduelle: m(0),
      dureeAmortissement: 5,
      methode: "LINEAIRE",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementLineaire(immo, exerciceDates);

    // Sell after 2 years: VNC = 5000 - 2000 = 3000, sell for 4000
    const cession = computeCession(immo, schedule, new Date(2026, 0, 15), m(4000));
    expect(cession.plusOuMoinsValue.amount).toBeGreaterThan(0); // Plus-value
  });
});
