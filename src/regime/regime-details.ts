import { EUR, type Monetary, monetary } from "monetary";
import type {
  ActivityGroupCode,
  RegimeCode,
  TaxSystem,
} from "../models.js";

export type ThresholdConfig = {
  min?: Monetary<number>;
  max: Monetary<number>;
};

// ============================================================================
// 2025 Regulatory Thresholds (Canonical Source)
// ============================================================================

export const MICRO_THRESHOLDS = {
  BIC_GOODS: monetary({ amount: 18_870_000, currency: EUR }),
  BIC_SERVICES: monetary({ amount: 7_770_000, currency: EUR }),
  BNC: monetary({ amount: 7_770_000, currency: EUR }),
} as const;

export const VAT_THRESHOLDS = {
  GOODS: monetary({ amount: 8_500_000, currency: EUR }),
  SERVICES: monetary({ amount: 3_750_000, currency: EUR }),
} as const;

export const REEL_SIMPLIFIE_THRESHOLDS = {
  BIC_SERVICES: monetary({ amount: 25_400_000, currency: EUR }),
  BIC_GOODS: monetary({ amount: 84_000_000, currency: EUR }),
} as const;

export const NO_LIMIT = monetary({
  amount: Number.MAX_SAFE_INTEGER,
  currency: EUR,
});

export type Contribution = {
  code: string;
  name: string;
  rate: number;
  category: "social" | "tax" | "professional" | "other";
  isAffectedByACRE?: boolean;
  isOptional?: boolean;
};

export type DeclarationForm = {
  code: string;
  name: string;
  description: string;
  isRequired: boolean;
  condition?: "IR" | "IS";
};

export type AccountingRequirement = {
  name: string;
  description: string;
};

export type DeclarationRequirements = {
  forms: DeclarationForm[];
  deadline: {
    type: "fixed" | "relative";
    description: string;
  };
  mustBeElectronic: boolean;
  accountingRequirements: readonly AccountingRequirement[];
};

export type RegimeConfig = {
  name: string;
  regime: RegimeCode;
  validActivityGroupCodes: ActivityGroupCode[];
  isAutoEntrepreneur: boolean;
  taxSystem: {
    allowed: TaxSystem[];
    default: TaxSystem;
  };
  contributions?: Contribution[];
  thresholds: Partial<Record<ActivityGroupCode, ThresholdConfig>>;
  declarations: DeclarationRequirements;
};

const FORMS = {
  FORM_2042C_PRO: {
    code: "2042-C-PRO",
    name: "Déclaration des revenus professionnels",
    description: "Personal income tax declaration for professional income",
    isRequired: true,
  },
  FORM_2035: {
    code: "2035",
    name: "Déclaration des bénéfices non commerciaux",
    description: "Declaration of non-commercial profits",
    isRequired: true,
  },
  FORM_2031: {
    code: "2031",
    name: "Déclaration des bénéfices industriels et commerciaux",
    description: "Declaration of industrial and commercial profits",
    isRequired: true,
    condition: "IR",
  },
  FORM_2065: {
    code: "2065",
    name: "Déclaration de résultats",
    description: "Corporate tax return",
    isRequired: true,
    condition: "IS",
  },
  FORM_2033: {
    code: "2033",
    name: "Bilan simplifié",
    description: "Simplified balance sheet",
    isRequired: true,
  },
  FORM_2050: {
    code: "2050",
    name: "Bilan complet",
    description: "Complete balance sheet",
    isRequired: true,
  },
} as const;

const ACCOUNTING_REQUIREMENTS = {
  MICRO: [
    { name: "Sales ledger", description: "Record of all sales and income" },
    { name: "Purchase ledger", description: "Record of all purchases (for goods resale activities)" },
  ],
  DECLARATION_CONTROLEE: [
    { name: "Complete accounting", description: "Full accounting records including income and expenses" },
    { name: "Supporting documents", description: "All invoices and receipts must be kept" },
  ],
  REEL_SIMPLIFIE: [
    { name: "Basic balance sheet", description: "Simplified balance sheet" },
    { name: "Income statement", description: "Statement of income and expenses" },
    { name: "Daily journal", description: "Daily record of receipts and expenses" },
    { name: "Year-end adjustments", description: "Recording of debts and receivables at year end" },
  ],
  REEL_NORMAL: [
    { name: "Full accounting", description: "Complete accounting with supporting documents" },
    { name: "Chronological recording", description: "Chronological recording of all patrimony changes" },
    { name: "Annual inventory", description: "Complete inventory at least once every 12 months" },
    { name: "Annual accounts", description: "Full balance sheet, income statement, and appendices" },
    { name: "Accounting books", description: "Journal and general ledger" },
  ],
} as const;

export const REGIME_CONFIG: Record<RegimeCode, RegimeConfig> = {
  MICRO_ENTREPRISE: {
    name: "Micro-entreprise",
    regime: "MICRO_ENTREPRISE",
    validActivityGroupCodes: ["BNC", "BIC_SERVICES", "BIC_GOODS"],
    isAutoEntrepreneur: true,
    taxSystem: { allowed: ["IR"], default: "IR" },
    thresholds: {
      BNC: { max: MICRO_THRESHOLDS.BNC },
      BIC_SERVICES: { max: MICRO_THRESHOLDS.BIC_SERVICES },
      BIC_GOODS: { max: MICRO_THRESHOLDS.BIC_GOODS },
    },
    declarations: {
      forms: [FORMS.FORM_2042C_PRO],
      deadline: { type: "fixed", description: "2nd business day after May 1st of year N+1" },
      mustBeElectronic: true,
      accountingRequirements: ACCOUNTING_REQUIREMENTS.MICRO,
    },
  },
  DECLARATION_CONTROLEE: {
    name: "Déclaration contrôlée",
    regime: "DECLARATION_CONTROLEE",
    validActivityGroupCodes: ["BNC"],
    isAutoEntrepreneur: false,
    taxSystem: { allowed: ["IR"], default: "IR" },
    thresholds: { BNC: { min: MICRO_THRESHOLDS.BNC, max: NO_LIMIT } },
    declarations: {
      forms: [FORMS.FORM_2042C_PRO, FORMS.FORM_2035],
      deadline: { type: "fixed", description: "2nd business day after May 1st of year N+1" },
      mustBeElectronic: true,
      accountingRequirements: ACCOUNTING_REQUIREMENTS.DECLARATION_CONTROLEE,
    },
  },
  REEL_SIMPLIFIE: {
    name: "Régime réel simplifié",
    regime: "REEL_SIMPLIFIE",
    validActivityGroupCodes: ["BIC_SERVICES", "BIC_GOODS"],
    isAutoEntrepreneur: false,
    taxSystem: { allowed: ["IR", "IS"], default: "IS" },
    thresholds: {
      BIC_SERVICES: { min: MICRO_THRESHOLDS.BIC_SERVICES, max: REEL_SIMPLIFIE_THRESHOLDS.BIC_SERVICES },
      BIC_GOODS: { min: MICRO_THRESHOLDS.BIC_GOODS, max: REEL_SIMPLIFIE_THRESHOLDS.BIC_GOODS },
    },
    declarations: {
      forms: [FORMS.FORM_2031, FORMS.FORM_2065, FORMS.FORM_2033],
      deadline: { type: "fixed", description: "Within 3 months of fiscal year end" },
      mustBeElectronic: true,
      accountingRequirements: ACCOUNTING_REQUIREMENTS.REEL_SIMPLIFIE,
    },
  },
  REEL_NORMAL: {
    name: "Régime réel normal",
    regime: "REEL_NORMAL",
    validActivityGroupCodes: ["BIC_SERVICES", "BIC_GOODS"],
    isAutoEntrepreneur: false,
    taxSystem: { allowed: ["IR", "IS"], default: "IS" },
    thresholds: {
      BIC_SERVICES: { min: REEL_SIMPLIFIE_THRESHOLDS.BIC_SERVICES, max: NO_LIMIT },
      BIC_GOODS: { min: REEL_SIMPLIFIE_THRESHOLDS.BIC_GOODS, max: NO_LIMIT },
    },
    declarations: {
      forms: [FORMS.FORM_2031, FORMS.FORM_2065, FORMS.FORM_2050],
      deadline: { type: "fixed", description: "Within 3 months of fiscal year end" },
      mustBeElectronic: true,
      accountingRequirements: ACCOUNTING_REQUIREMENTS.REEL_NORMAL,
    },
  },
};
