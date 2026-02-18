/**
 * VAT rules for French business transactions according to PCG and French VAT regulations.
 */

const VAT_EXEMPT_PCG_CODES = [
  4457, 4456, 120, 645, 6351, 635, 671, 627, 661, 764, 101, 164, 681, 781, 616,
];

const VAT_EXEMPT_CATEGORY_NAMES = [
  "TVA collectée",
  "TVA déductible",
  "Impôt sur le revenu",
  "Cotisations sociales",
  "Contribution Foncière des Entreprises",
  "Taxes diverses",
  "Pénalités fiscales",
  "Services bancaires",
  "Intérêts d'emprunts",
  "Produits financiers",
  "Apports en capital",
  "Emprunts",
  "Remboursements d'emprunts",
  "Amortissements",
  "Reprises sur amortissements",
  "Assurances",
];

export function getAutomaticVatRate(category: {
  pcg_account?: number | null;
  name: string;
}): number | null {
  if (category.pcg_account && VAT_EXEMPT_PCG_CODES.includes(category.pcg_account)) return 0;
  if (VAT_EXEMPT_CATEGORY_NAMES.includes(category.name)) return 0;
  return null;
}

export function isVatExemptCategory(category: {
  pcg_account?: number | null;
  name: string;
}): boolean {
  return getAutomaticVatRate(category) === 0;
}

export type TaxRateOption = { value: string; label: string };

export function getTaxRateOptions(t: (key: string) => string): TaxRateOption[] {
  return [
    { value: "0", label: t("none") },
    { value: "2.1", label: t("superReduced") },
    { value: "5.5", label: t("reduced") },
    { value: "10", label: t("intermediate") },
    { value: "20", label: t("normal") },
  ];
}
