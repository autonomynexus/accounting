import type { AccountClass, AccountTypeCode, PcgAccountModel } from "./models.js";

type PcgAccountDefinition = {
  code: string;
  name: string;
  class: AccountClass;
  typeId: AccountTypeCode;
  isDebitNormal: boolean;
  parentCode?: string;
};

// Standard PCG accounts for freelancers (EI, micro, EURL, SASU)
export const PCG_ACCOUNTS: PcgAccountDefinition[] = [
  // Class 1 - Capitaux
  { code: "101", name: "Capital", class: 1, typeId: "EQUITY", isDebitNormal: false },
  { code: "108", name: "Compte de l'exploitant", class: 1, typeId: "EQUITY", isDebitNormal: false },
  { code: "110", name: "Report à nouveau (créditeur)", class: 1, typeId: "EQUITY", isDebitNormal: false },
  { code: "120", name: "Résultat de l'exercice (bénéfice)", class: 1, typeId: "EQUITY", isDebitNormal: false },
  { code: "164", name: "Emprunts auprès des établissements de crédit", class: 1, typeId: "LIABILITY", isDebitNormal: false },
  // Class 2 - Immobilisations
  { code: "205", name: "Concessions et droits similaires", class: 2, typeId: "ASSET", isDebitNormal: true },
  { code: "218", name: "Autres immobilisations corporelles", class: 2, typeId: "ASSET", isDebitNormal: true },
  { code: "281", name: "Amortissements des immobilisations incorporelles", class: 2, typeId: "ASSET", isDebitNormal: false },
  // Class 4 - Comptes de tiers
  { code: "401", name: "Fournisseurs", class: 4, typeId: "LIABILITY", isDebitNormal: false },
  { code: "411", name: "Clients", class: 4, typeId: "ASSET", isDebitNormal: true },
  { code: "421", name: "Personnel - Rémunérations dues", class: 4, typeId: "LIABILITY", isDebitNormal: false },
  { code: "431", name: "Sécurité sociale", class: 4, typeId: "LIABILITY", isDebitNormal: false },
  { code: "4456", name: "TVA déductible", class: 4, typeId: "ASSET", isDebitNormal: true },
  { code: "4457", name: "TVA collectée", class: 4, typeId: "LIABILITY", isDebitNormal: false },
  { code: "447", name: "Autres impôts, taxes et versements assimilés", class: 4, typeId: "LIABILITY", isDebitNormal: false },
  { code: "486", name: "Charges constatées d'avance", class: 4, typeId: "ASSET", isDebitNormal: true },
  { code: "487", name: "Produits constatés d'avance", class: 4, typeId: "LIABILITY", isDebitNormal: false },
  // Class 5 - Comptes financiers
  { code: "512", name: "Banques", class: 5, typeId: "ASSET", isDebitNormal: true },
  { code: "530", name: "Caisse", class: 5, typeId: "ASSET", isDebitNormal: true },
  // Class 6 - Charges
  { code: "601", name: "Achats de matières premières", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "606", name: "Achats non stockés de matières et fournitures", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "607", name: "Achats de marchandises", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "613", name: "Locations", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "616", name: "Primes d'assurance", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "622", name: "Rémunérations d'intermédiaires et honoraires", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "623", name: "Publicité, publications, relations publiques", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "625", name: "Déplacements, missions et réceptions", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "626", name: "Frais postaux et de télécommunications", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "627", name: "Services bancaires et assimilés", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "641", name: "Rémunérations du personnel", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "645", name: "Charges de sécurité sociale et de prévoyance", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "661", name: "Charges d'intérêts", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "681", name: "Dotations aux amortissements", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  { code: "695", name: "Impôts sur les bénéfices", class: 6, typeId: "EXPENSE", isDebitNormal: true },
  // Class 7 - Produits
  { code: "701", name: "Ventes de produits finis", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "706", name: "Prestations de services", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "707", name: "Ventes de marchandises", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "708", name: "Produits des activités annexes", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "740", name: "Subventions d'exploitation", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "758", name: "Produits divers de gestion courante", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "761", name: "Produits financiers", class: 7, typeId: "REVENUE", isDebitNormal: false },
  { code: "781", name: "Reprises sur amortissements", class: 7, typeId: "REVENUE", isDebitNormal: false },
];

/** Convert to insert-ready format */
export function getPcgAccountsForInsert(): PcgAccountModel[] {
  return PCG_ACCOUNTS.map((acc) => ({
    code: acc.code,
    name: acc.name,
    class: acc.class,
    typeId: acc.typeId,
    isDebitNormal: acc.isDebitNormal,
    parentCode: acc.parentCode ?? null,
    isActive: true,
  }));
}

export function getAccountDefinition(code: string): PcgAccountDefinition | undefined {
  return PCG_ACCOUNTS.find((acc) => acc.code === code);
}

export function getRevenueAccountCodes(): string[] {
  return PCG_ACCOUNTS.filter((acc) => acc.class === 7).map((acc) => acc.code);
}

export function getExpenseAccountCodes(): string[] {
  return PCG_ACCOUNTS.filter((acc) => acc.class === 6).map((acc) => acc.code);
}

// VAT accounts
export const VAT_DEDUCTIBLE_ACCOUNT = "4456" // Parent account (for querying all deductible)
export const VAT_DEDUCTIBLE_IMMOS = "44562" // TVA déductible sur immobilisations (CA3 ligne 20)
export const VAT_DEDUCTIBLE_ABS = "44566" // TVA déductible sur autres biens et services (CA3 ligne 19)
export const VAT_COLLECTED_ACCOUNT = "4457"
export const OTHER_TAXES_ACCOUNT = "447" // Autres impôts, taxes et versements assimilés (3310-A, 3310-TIC)

// Common accounts
export const BANK_ACCOUNT = "512"
export const CLIENT_ACCOUNT = "411"
export const BANK_COMMISSION_ACCOUNT = "6278"
export const FOREX_LOSS_ACCOUNT = "656"
export const FOREX_GAIN_ACCOUNT = "756"
export const DISCOUNT_ACCOUNT = "665"
export const PAYMENT_PROCESSOR_FEE_ACCOUNT = "6278"

/**
 * Get the appropriate VAT deductible account based on expense account class.
 * Class 2 (immobilisations) → 44562, everything else → 44566
 */
export function getVatDeductibleAccount(expenseAccountCode: string): string {
  const account = getAccountDefinition(expenseAccountCode)
  if (account && account.class === 2) {
    return VAT_DEDUCTIBLE_IMMOS // Immobilisations → 44562
  }
  return VAT_DEDUCTIBLE_ABS // All other expenses → 44566
}
