import type { ScaledAmount } from "monetary";

export type VatCode =
  | "TVA20"
  | "TVA10"
  | "TVA55"
  | "TVA21"
  | "TVA0"
  | "TVA85"
  | "TVA21_DOM"
  | "TVA175"
  | "TVA105";

const VALID_VAT_CODES = new Set<string>([
  "TVA20",
  "TVA10",
  "TVA55",
  "TVA21",
  "TVA0",
  "TVA85",
  "TVA21_DOM",
  "TVA175",
  "TVA105",
]);

const DOM_TOM_VAT_CODES = new Set<VatCode>(["TVA85", "TVA21_DOM", "TVA175", "TVA105"]);

export function isValidVatCode(code: string | null | undefined): code is VatCode {
  return code !== null && code !== undefined && VALID_VAT_CODES.has(code);
}

export function isDomTomVatCode(code: VatCode): boolean {
  return DOM_TOM_VAT_CODES.has(code);
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
  85: "TVA85",
};

const VAT_RATES_SCALE4: Record<number, VatCode> = {
  175: "TVA175",
  105: "TVA105",
  850: "TVA85",
};

function normalizeToScale3(rate: ScaledAmount<number>): number {
  const targetScale = 3;
  if (rate.scale === targetScale) return rate.amount;
  if (rate.scale < targetScale) return rate.amount * 10 ** (targetScale - rate.scale);
  return Math.round(rate.amount / 10 ** (rate.scale - targetScale));
}

function normalizeToScale4(rate: ScaledAmount<number>): number {
  const targetScale = 4;
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
  const normalizedScale3 = normalizeToScale3(taxRate);
  let code = VAT_RATES[normalizedScale3] ?? "TVA0";
  if (code === "TVA0") {
    const normalizedScale4 = normalizeToScale4(taxRate);
    code = VAT_RATES_SCALE4[normalizedScale4] ?? "TVA0";
  }
  return { code, account };
}

export function hasVat(taxRate: ScaledAmount<number> | null | undefined): boolean {
  return taxRate !== null && taxRate !== undefined && taxRate.amount > 0;
}

export function getVatRatePercentage(code: VatCode): number {
  switch (code) {
    case "TVA20":
      return 20;
    case "TVA10":
      return 10;
    case "TVA55":
      return 5.5;
    case "TVA21":
      return 2.1;
    case "TVA0":
      return 0;
    case "TVA85":
      return 8.5;
    case "TVA21_DOM":
      return 2.1;
    case "TVA175":
      return 1.75;
    case "TVA105":
      return 1.05;
  }
}
