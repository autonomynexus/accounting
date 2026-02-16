import type { ScaledAmount } from "monetary";

export type VatCode = "TVA20" | "TVA10" | "TVA55" | "TVA21" | "TVA0";

const VALID_VAT_CODES = new Set<string>(["TVA20", "TVA10", "TVA55", "TVA21", "TVA0"]);

export function isValidVatCode(code: string | null | undefined): code is VatCode {
  return code !== null && code !== undefined && VALID_VAT_CODES.has(code);
}

export const VAT_COLLECTED_ACCOUNT = "4457";
export const VAT_DEDUCTIBLE_ACCOUNT = "4456";

export type VatInfo = {
  readonly code: VatCode;
  readonly account: string;
};

const VAT_RATES: Record<number, VatCode> = {
  200: "TVA20",
  100: "TVA10",
  55: "TVA55",
  21: "TVA21",
};

function normalizeToScale3(rate: ScaledAmount<number>): number {
  const targetScale = 3;
  if (rate.scale === targetScale) return rate.amount;
  if (rate.scale < targetScale) return rate.amount * 10 ** (targetScale - rate.scale);
  return Math.round(rate.amount / 10 ** (rate.scale - targetScale));
}

export function getVatInfo(
  taxRate: ScaledAmount<number> | null | undefined,
  isRevenue: boolean,
): VatInfo {
  const account = isRevenue ? VAT_COLLECTED_ACCOUNT : VAT_DEDUCTIBLE_ACCOUNT;
  if (!taxRate || taxRate.amount === 0) return { code: "TVA0", account };
  const normalized = normalizeToScale3(taxRate);
  const code = VAT_RATES[normalized] ?? "TVA0";
  return { code, account };
}

export function hasVat(taxRate: ScaledAmount<number> | null | undefined): boolean {
  return taxRate !== null && taxRate !== undefined && taxRate.amount > 0;
}
