/**
 * Canonical VAT calculation formulas for French business.
 * All calculations use the monetary library to maintain precision.
 */
import type { Monetary, ScaledAmount } from "monetary";
import { add, allocate, EUR, monetary, multiply, subtract } from "monetary";

export function calculateHTfromTTC(
  ttc: Monetary<number>,
  vatRate: ScaledAmount<number>,
): Monetary<number> {
  if (vatRate.amount === 0) return ttc;
  const htRatio = 10 ** vatRate.scale;
  const vatRatio = vatRate.amount;
  const [ht] = allocate(ttc, [htRatio, vatRatio]);
  if (!ht) throw new Error("Failed to allocate monetary value");
  return ht;
}

export function calculateTTCfromHT(
  ht: Monetary<number>,
  vatRate: ScaledAmount<number>,
): Monetary<number> {
  const multiplier: ScaledAmount<number> = {
    amount: 10 ** vatRate.scale + vatRate.amount,
    scale: vatRate.scale,
  };
  return multiply(ht, multiplier);
}

export function calculateVATfromTTC(
  ttc: Monetary<number>,
  vatRate: ScaledAmount<number>,
): Monetary<number> {
  if (vatRate.amount === 0) return multiply(ttc, 0);
  const ht = calculateHTfromTTC(ttc, vatRate);
  return subtract(ttc, ht);
}

export function calculateVATfromHT(
  ht: Monetary<number>,
  vatRate: ScaledAmount<number>,
): Monetary<number> {
  return multiply(ht, vatRate);
}

export const FRENCH_VAT_RATES = {
  STANDARD: 20,
  INTERMEDIATE: 10,
  REDUCED: 5.5,
  SUPER_REDUCED: 2.1,
  EXEMPT: 0,
} as const;

export function isValidFrenchVATRate(rate: number): boolean {
  return Object.values(FRENCH_VAT_RATES).includes(
    rate as (typeof FRENCH_VAT_RATES)[keyof typeof FRENCH_VAT_RATES],
  );
}

export type TaxableItem = {
  readonly amount: Monetary<number>;
  readonly taxRate: ScaledAmount<number> | null;
};

export type ItemTotals = {
  readonly totalHT: Monetary<number>;
  readonly totalTTC: Monetary<number>;
  readonly totalVAT: Monetary<number>;
};

export function calculateItemsTotals(items: TaxableItem[]): ItemTotals {
  return items.reduce(
    (acc, item) => {
      const itemHT = item.amount;
      const itemVAT = item.taxRate
        ? calculateVATfromHT(itemHT, item.taxRate)
        : multiply(itemHT, 0);
      const itemTTC = add(itemHT, itemVAT);
      return {
        totalHT: add(acc.totalHT, itemHT),
        totalTTC: add(acc.totalTTC, itemTTC),
        totalVAT: add(acc.totalVAT, itemVAT),
      };
    },
    {
      totalHT: multiply(items[0]?.amount ?? monetary({ amount: 0, currency: EUR }), 0),
      totalTTC: multiply(items[0]?.amount ?? monetary({ amount: 0, currency: EUR }), 0),
      totalVAT: multiply(items[0]?.amount ?? monetary({ amount: 0, currency: EUR }), 0),
    },
  );
}
