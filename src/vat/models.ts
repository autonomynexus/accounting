import type { Monetary } from "monetary";
import type { Period } from "../models.js";
import type { VatCode } from "./utils.js";

export type VatRegime = "franchise" | "reel_simplifie" | "reel_normal";
export type VatDeclarationFrequency = "monthly" | "quarterly" | "annual";

export type ComputeVatDeclarationInput = {
  readonly period: Period;
  readonly regime: VatRegime;
};

export type VatByRate = {
  readonly code: VatCode;
  readonly collected: Monetary<number>;
  readonly deductible: Monetary<number>;
  readonly net: Monetary<number>;
};

export type VatTotals = {
  readonly totalCollected: Monetary<number>;
  readonly totalDeductible: Monetary<number>;
  readonly netVat: Monetary<number>;
};

export type VatDeclarationResult = {
  readonly period: Period;
  readonly regime: VatRegime;
  readonly byRate: readonly VatByRate[];
  readonly totals: VatTotals;
  readonly isCredit: boolean;
};

export type Ca3Declaration = {
  readonly ligne01: Monetary<number>;
  readonly ligne02: Monetary<number>;
  readonly ligne03: Monetary<number>;
  readonly ligne08: Monetary<number>;
  readonly ligne09: Monetary<number>;
  readonly ligne16: Monetary<number>;
  readonly ligne19: Monetary<number>;
  readonly ligne20: Monetary<number>;
  readonly ligne23: Monetary<number>;
  readonly ligne25: Monetary<number>;
  readonly ligne28: Monetary<number>;
};

export type Ca12Declaration = {
  readonly exercice: { readonly startDate: Date; readonly endDate: Date };
  readonly chiffreAffairesHT: Monetary<number>;
  readonly tvaCollectee: Monetary<number>;
  readonly tvaDeductible: Monetary<number>;
  readonly tvaNette: Monetary<number>;
  readonly acomptes: Monetary<number>;
  readonly solde: Monetary<number>;
};
