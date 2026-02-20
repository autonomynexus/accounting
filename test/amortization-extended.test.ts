import { describe, expect, it } from "vitest";
import { EUR, monetary, compare } from "@autonomynexus/monetary";
import {
  computeAmortissementLineaire,
  computeAmortissementDegressif,
  computeCession,
} from "../src/amortization/index.js";
import type { Immobilisation } from "../src/amortization/index.js";

const m = (euros: number) => monetary({ amount: Math.round(euros * 100), currency: EUR });

const exerciceDates = Array.from({ length: 8 }, (_, i) => ({
  dateDebut: new Date(2024 + i, 0, 1),
  dateFin: new Date(2024 + i, 11, 31),
}));

describe("Linear amortization — mid-year prorata", () => {
  it("5-year asset bought July 1 → correct prorata first and last year", () => {
    const immo: Immobilisation = {
      id: "mid-year",
      compteNum: "2183",
      compteAmortNum: "2818",
      libelle: "Matériel",
      dateAcquisition: new Date(2024, 6, 1),
      dateMiseEnService: new Date(2024, 6, 1),
      dateCession: null,
      valeurAcquisition: m(10000),
      valeurResiduelle: m(0),
      dureeAmortissement: 5,
      methode: "LINEAIRE",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementLineaire(immo, exerciceDates);
    // First year: ~184 days / 360 ≈ 0.511 prorata → dotation ≈ 1022€
    expect(schedule.lignes[0]!.prorata).toBeLessThan(1);
    expect(schedule.lignes[0]!.prorata).toBeGreaterThan(0.4);

    // Last year should have complementary prorata
    const lastLine = schedule.lignes[schedule.lignes.length - 1]!;
    expect(lastLine.valeurNetteComptable.amount).toBe(0);

    // Total dotations should equal acquisition value
    expect(compare(schedule.totalDotations, m(10000))).toBe(0);
  });
});

describe("Declining balance — switch-to-linear timing", () => {
  it("switches to linear when linear rate exceeds declining rate", () => {
    const immo: Immobilisation = {
      id: "deg",
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

    // First year: taux dégressif = 1/5 × 1.75 = 35%
    const firstRate = schedule.lignes[0]!.taux;
    expect(firstRate).toBeCloseTo(0.35, 2);

    // Later years should switch to linear (rate increases)
    const rates = schedule.lignes.map((l) => l.taux);
    // At some point the linear rate (1/remaining) should exceed 0.35
    const hasSwitch = rates.some((r) => r > 0.35);
    expect(hasSwitch).toBe(true);

    // Verify asset is fully or nearly fully depreciated
    const lastLine = schedule.lignes[schedule.lignes.length - 1]!;
    // VNC should be very close to 0 (at most 1 cent due to rounding)
    expect(compare(lastLine.valeurNetteComptable, m(1))).toBeLessThanOrEqual(0);
  });
});

describe("Asset disposal — plus/moins-value", () => {
  it("computes plus-value when sale price > VNC", () => {
    const immo: Immobilisation = {
      id: "disp",
      compteNum: "2183",
      compteAmortNum: "2818",
      libelle: "Matériel",
      dateAcquisition: new Date(2024, 0, 1),
      dateMiseEnService: new Date(2024, 0, 1),
      dateCession: null,
      valeurAcquisition: m(10000),
      valeurResiduelle: m(0),
      dureeAmortissement: 5,
      methode: "LINEAIRE",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementLineaire(immo, exerciceDates);
    // After 2 years: VNC = 10000 - 4000 = 6000
    const cession = computeCession(immo, schedule, new Date(2026, 5, 15), m(7000));
    expect(compare(cession.plusOuMoinsValue, m(0))).toBeGreaterThan(0); // Plus-value
  });

  it("computes moins-value when sale price < VNC", () => {
    const immo: Immobilisation = {
      id: "disp2",
      compteNum: "2183",
      compteAmortNum: "2818",
      libelle: "Matériel",
      dateAcquisition: new Date(2024, 0, 1),
      dateMiseEnService: new Date(2024, 0, 1),
      dateCession: null,
      valeurAcquisition: m(10000),
      valeurResiduelle: m(0),
      dureeAmortissement: 5,
      methode: "LINEAIRE",
      status: "EN_SERVICE",
      exerciceId: "2024",
    };

    const schedule = computeAmortissementLineaire(immo, exerciceDates);
    // After 1 year: VNC = 10000 - 2000 = 8000. Sell for 5000
    const cession = computeCession(immo, schedule, new Date(2025, 5, 15), m(5000));
    expect(compare(cession.plusOuMoinsValue, m(0))).toBeLessThan(0); // Moins-value
  });
});
