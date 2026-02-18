/**
 * Double-Entry Bookkeeping Engine — Pure Computations
 *
 * Trial balance, general ledger, subsidiary ledger computation
 * from journal entries. Pure functions, no side effects.
 */

import { add, EUR, monetary, subtract, isZero, greaterThan } from "monetary";
import type { MonetaryAmount } from "../models.js";
import type {
  EcritureComptable,
  LigneEcriture,
  TrialBalance,
  TrialBalanceLine,
  GrandLivre,
  GrandLivreAccount,
  GrandLivreEntry,
  BalanceAuxiliaire,
  BalanceAuxiliaireLine,
  LettrageResult,
  CreateEcritureInput,
} from "./models.js";

const ZERO = monetary({ amount: 0, currency: EUR });

// ============================================================================
// Validation
// ============================================================================

export type EcritureValidationError = {
  readonly type: "NO_LINES" | "UNBALANCED" | "ZERO_AMOUNT" | "INVALID_LINE" | "INVALID_ACCOUNT";
  readonly message: string;
};

/** Validate an écriture comptable (debit = credit, at least 2 lines, etc.) */
export function validateEcriture(input: CreateEcritureInput): readonly EcritureValidationError[] {
  const errors: EcritureValidationError[] = [];

  if (input.lignes.length < 2) {
    errors.push({ type: "NO_LINES", message: "Une écriture doit comporter au moins 2 lignes" });
  }

  let totalDebit = ZERO;
  let totalCredit = ZERO;

  for (let i = 0; i < input.lignes.length; i++) {
    const ligne = input.lignes[i]!;
    const hasDebit = !isZero(ligne.debit);
    const hasCredit = !isZero(ligne.credit);

    if (hasDebit && hasCredit) {
      errors.push({
        type: "INVALID_LINE",
        message: `Ligne ${i + 1} (${ligne.compteNum}): ne peut pas avoir à la fois un débit et un crédit`,
      });
    }

    if (!hasDebit && !hasCredit) {
      errors.push({
        type: "INVALID_LINE",
        message: `Ligne ${i + 1} (${ligne.compteNum}): doit avoir un débit ou un crédit`,
      });
    }

    if (!ligne.compteNum || ligne.compteNum.trim() === "") {
      errors.push({
        type: "INVALID_ACCOUNT",
        message: `Ligne ${i + 1}: numéro de compte manquant`,
      });
    }

    totalDebit = add(totalDebit, ligne.debit);
    totalCredit = add(totalCredit, ligne.credit);
  }

  if (!isZero(subtract(totalDebit, totalCredit))) {
    errors.push({
      type: "UNBALANCED",
      message: `Écriture déséquilibrée: débit (${totalDebit.amount}) ≠ crédit (${totalCredit.amount})`,
    });
  }

  if (isZero(totalDebit)) {
    errors.push({
      type: "ZERO_AMOUNT",
      message: "Le montant total de l'écriture ne peut pas être nul",
    });
  }

  return errors;
}

// ============================================================================
// Trial Balance (Balance des comptes)
// ============================================================================

/** Compute trial balance from journal entries */
export function computeTrialBalance(
  ecritures: readonly EcritureComptable[],
  exerciceId: string,
  dateDebut: Date,
  dateFin: Date,
): TrialBalance {
  // Filter ecritures in period and not cancelled
  const filteredEcritures = ecritures.filter(
    (e) =>
      e.exerciceId === exerciceId &&
      e.status !== "ANNULEE" &&
      e.date >= dateDebut &&
      e.date <= dateFin,
  );

  // Aggregate by account
  const accountMap = new Map<string, { lib: string; debit: MonetaryAmount; credit: MonetaryAmount }>();

  for (const ecriture of filteredEcritures) {
    for (const ligne of ecriture.lignes) {
      const existing = accountMap.get(ligne.compteNum);
      if (existing) {
        existing.debit = add(existing.debit, ligne.debit);
        existing.credit = add(existing.credit, ligne.credit);
      } else {
        accountMap.set(ligne.compteNum, {
          lib: ligne.compteLib,
          debit: ligne.debit,
          credit: ligne.credit,
        });
      }
    }
  }

  // Build lines sorted by account number
  const lignes: TrialBalanceLine[] = [];
  const sortedAccounts = [...accountMap.entries()].sort(([a], [b]) => a.localeCompare(b));

  let totalDebit = ZERO;
  let totalCredit = ZERO;
  let totalSoldeDebiteur = ZERO;
  let totalSoldeCrediteur = ZERO;

  for (const [compteNum, data] of sortedAccounts) {
    const diff = subtract(data.debit, data.credit);
    const isDebitSolde = greaterThan(data.debit, data.credit);
    const soldeDebiteur = isDebitSolde ? diff : ZERO;
    const soldeCrediteur = isDebitSolde ? ZERO : subtract(data.credit, data.debit);

    lignes.push({
      compteNum,
      compteLib: data.lib,
      totalDebit: data.debit,
      totalCredit: data.credit,
      soldeDebiteur,
      soldeCrediteur,
    });

    totalDebit = add(totalDebit, data.debit);
    totalCredit = add(totalCredit, data.credit);
    totalSoldeDebiteur = add(totalSoldeDebiteur, soldeDebiteur);
    totalSoldeCrediteur = add(totalSoldeCrediteur, soldeCrediteur);
  }

  return {
    exerciceId,
    dateDebut,
    dateFin,
    generatedAt: new Date(),
    lignes,
    totalDebit,
    totalCredit,
    totalSoldeDebiteur,
    totalSoldeCrediteur,
    isBalanced: isZero(subtract(totalDebit, totalCredit)),
  };
}

// ============================================================================
// General Ledger (Grand Livre)
// ============================================================================

/** Compute general ledger from journal entries */
export function computeGrandLivre(
  ecritures: readonly EcritureComptable[],
  exerciceId: string,
  dateDebut: Date,
  dateFin: Date,
): GrandLivre {
  const filteredEcritures = ecritures.filter(
    (e) =>
      e.exerciceId === exerciceId &&
      e.status !== "ANNULEE" &&
      e.date >= dateDebut &&
      e.date <= dateFin,
  );

  // Sort écritures by date then numero
  const sorted = [...filteredEcritures].sort(
    (a, b) => a.date.getTime() - b.date.getTime() || a.numero.localeCompare(b.numero),
  );

  // Group lines by account
  const accountLines = new Map<string, { lib: string; entries: GrandLivreEntry[] }>();

  for (const ecriture of sorted) {
    for (const ligne of ecriture.lignes) {
      let acc = accountLines.get(ligne.compteNum);
      if (!acc) {
        acc = { lib: ligne.compteLib, entries: [] };
        accountLines.set(ligne.compteNum, acc);
      }
      acc.entries.push({
        date: ecriture.date,
        journalCode: ecriture.journalCode,
        ecritureNum: ecriture.numero,
        pieceRef: ecriture.pieceRef,
        libelle: ligne.libelle,
        debit: ligne.debit,
        credit: ligne.credit,
        soldeProgressif: ZERO, // Will be computed below
        lettrage: ligne.lettrage,
      });
    }
  }

  // Compute running balances and totals
  const accounts: GrandLivreAccount[] = [];
  const sortedAccountNums = [...accountLines.keys()].sort();

  for (const compteNum of sortedAccountNums) {
    const data = accountLines.get(compteNum)!;
    let runningBalance = ZERO;
    let totalDebit = ZERO;
    let totalCredit = ZERO;

    const entriesWithBalance: GrandLivreEntry[] = data.entries.map((entry) => {
      runningBalance = add(runningBalance, subtract(entry.debit, entry.credit));
      totalDebit = add(totalDebit, entry.debit);
      totalCredit = add(totalCredit, entry.credit);
      return { ...entry, soldeProgressif: runningBalance };
    });

    accounts.push({
      compteNum,
      compteLib: data.lib,
      soldeOuverture: ZERO,
      entries: entriesWithBalance,
      totalDebit,
      totalCredit,
      soldeCloture: runningBalance,
    });
  }

  return {
    exerciceId,
    dateDebut,
    dateFin,
    generatedAt: new Date(),
    accounts,
  };
}

// ============================================================================
// Subsidiary Ledger (Balance auxiliaire)
// ============================================================================

/** Compute subsidiary ledger for clients or suppliers */
export function computeBalanceAuxiliaire(
  ecritures: readonly EcritureComptable[],
  type: "CLIENTS" | "FOURNISSEURS",
  exerciceId: string,
  dateDebut: Date,
  dateFin: Date,
): BalanceAuxiliaire {
  const principalAccount = type === "CLIENTS" ? "411" : "401";

  const filteredEcritures = ecritures.filter(
    (e) =>
      e.exerciceId === exerciceId &&
      e.status !== "ANNULEE" &&
      e.date >= dateDebut &&
      e.date <= dateFin,
  );

  // Aggregate by auxiliary account
  const auxMap = new Map<string, { lib: string; debit: MonetaryAmount; credit: MonetaryAmount }>();

  for (const ecriture of filteredEcritures) {
    for (const ligne of ecriture.lignes) {
      if (ligne.compteNum.startsWith(principalAccount) && ligne.compteAuxNum) {
        const existing = auxMap.get(ligne.compteAuxNum);
        if (existing) {
          existing.debit = add(existing.debit, ligne.debit);
          existing.credit = add(existing.credit, ligne.credit);
        } else {
          auxMap.set(ligne.compteAuxNum, {
            lib: ligne.compteAuxLib ?? ligne.compteAuxNum,
            debit: ligne.debit,
            credit: ligne.credit,
          });
        }
      }
    }
  }

  const lignes: BalanceAuxiliaireLine[] = [];
  let totalDebit = ZERO;
  let totalCredit = ZERO;
  let totalSolde = ZERO;

  for (const [auxNum, data] of [...auxMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const solde = subtract(data.debit, data.credit);
    lignes.push({
      compteAuxNum: auxNum,
      compteAuxLib: data.lib,
      comptePrincipalNum: principalAccount,
      totalDebit: data.debit,
      totalCredit: data.credit,
      solde,
    });
    totalDebit = add(totalDebit, data.debit);
    totalCredit = add(totalCredit, data.credit);
    totalSolde = add(totalSolde, solde);
  }

  return {
    type,
    exerciceId,
    dateDebut,
    dateFin,
    generatedAt: new Date(),
    lignes,
    totalDebit,
    totalCredit,
    totalSolde,
  };
}

// ============================================================================
// Lettrage (Account Matching)
// ============================================================================

/** Check if a set of lines can be lettered (balanced) */
export function computeLettrage(
  lignes: readonly LigneEcriture[],
  code: string,
): LettrageResult {
  if (lignes.length < 2) {
    return { success: false, code: null, error: "Le lettrage nécessite au moins 2 lignes", solde: null };
  }

  // All lines must be on the same account
  const comptes = new Set(lignes.map((l) => l.compteNum));
  if (comptes.size > 1) {
    return { success: false, code: null, error: "Toutes les lignes doivent être sur le même compte", solde: null };
  }

  let totalDebit = ZERO;
  let totalCredit = ZERO;
  for (const l of lignes) {
    totalDebit = add(totalDebit, l.debit);
    totalCredit = add(totalCredit, l.credit);
  }

  const solde = subtract(totalDebit, totalCredit);
  const isBalanced = isZero(solde);

  if (!isBalanced) {
    return {
      success: false,
      code: null,
      error: `Lettrage déséquilibré: solde résiduel de ${solde.amount}`,
      solde,
    };
  }

  return { success: true, code, error: null, solde: ZERO };
}

// ============================================================================
// Clôture d'exercice (Year-end closing)
// ============================================================================

export type ClotureResult = {
  readonly ecrituresCloture: readonly CreateEcritureInput[];
  readonly resultat: MonetaryAmount; // Positive = bénéfice, negative = perte
};

/**
 * Generate year-end closing entries.
 * Closes all Class 6 and Class 7 accounts to account 12 (Résultat).
 */
export function computeClotureExercice(
  trialBalance: TrialBalance,
  exerciceId: string,
  dateCloture: Date,
): ClotureResult {
  const lignesCloture: Array<{
    readonly compteNum: string;
    readonly compteLib: string;
    readonly debit: MonetaryAmount;
    readonly credit: MonetaryAmount;
  }> = [];

  let totalCharges = ZERO; // Class 6 = debit balances
  let totalProduits = ZERO; // Class 7 = credit balances

  for (const ligne of trialBalance.lignes) {
    // Only close class 6 and 7
    if (!ligne.compteNum.startsWith("6") && !ligne.compteNum.startsWith("7")) continue;

    if (ligne.compteNum.startsWith("6")) {
      // Charges: normally debit balance → credit to close
      const solde = subtract(ligne.totalDebit, ligne.totalCredit);
      if (!isZero(solde)) {
        totalCharges = add(totalCharges, solde);
        lignesCloture.push({
          compteNum: ligne.compteNum,
          compteLib: ligne.compteLib,
          debit: ZERO,
          credit: solde,
        });
      }
    } else {
      // Produits: normally credit balance → debit to close
      const solde = subtract(ligne.totalCredit, ligne.totalDebit);
      if (!isZero(solde)) {
        totalProduits = add(totalProduits, solde);
        lignesCloture.push({
          compteNum: ligne.compteNum,
          compteLib: ligne.compteLib,
          debit: solde,
          credit: ZERO,
        });
      }
    }
  }

  // Résultat = Produits - Charges
  const resultat = subtract(totalProduits, totalCharges);
  const isBenefice = greaterThan(resultat, ZERO) || isZero(resultat);

  // Add result line (120 or 129)
  if (!isZero(resultat)) {
    if (isBenefice) {
      lignesCloture.push({
        compteNum: "120",
        compteLib: "Résultat de l'exercice (bénéfice)",
        debit: ZERO,
        credit: resultat,
      });
    } else {
      const perte = subtract(ZERO, resultat);
      lignesCloture.push({
        compteNum: "129",
        compteLib: "Résultat de l'exercice (perte)",
        debit: perte,
        credit: ZERO,
      });
    }
  }

  const ecritureCloture: CreateEcritureInput = {
    journalCode: "OD",
    date: dateCloture,
    libelle: "Clôture des comptes de gestion",
    pieceRef: `CLO-${dateCloture.toISOString().slice(0, 10)}`,
    pieceDate: dateCloture,
    exerciceId,
    lignes: lignesCloture,
  };

  return {
    ecrituresCloture: [ecritureCloture],
    resultat,
  };
}

// ============================================================================
// À-nouveau (Opening entries)
// ============================================================================

/**
 * Generate opening entries for next exercise from closing trial balance.
 * Takes balance sheet accounts (classes 1-5) and creates opening entries.
 */
export function computeANouveau(
  trialBalance: TrialBalance,
  newExerciceId: string,
  dateOuverture: Date,
): CreateEcritureInput {
  const lignes: Array<{
    readonly compteNum: string;
    readonly compteLib: string;
    readonly debit: MonetaryAmount;
    readonly credit: MonetaryAmount;
  }> = [];

  for (const ligne of trialBalance.lignes) {
    // Only balance sheet accounts (classes 1-5)
    const cls = ligne.compteNum.charAt(0);
    if (!["1", "2", "3", "4", "5"].includes(cls)) continue;

    const solde = subtract(ligne.totalDebit, ligne.totalCredit);
    if (isZero(solde)) continue;

    if (greaterThan(solde, ZERO)) {
      lignes.push({
        compteNum: ligne.compteNum,
        compteLib: ligne.compteLib,
        debit: solde,
        credit: ZERO,
      });
    } else {
      lignes.push({
        compteNum: ligne.compteNum,
        compteLib: ligne.compteLib,
        debit: ZERO,
        credit: subtract(ZERO, solde),
      });
    }
  }

  return {
    journalCode: "AN",
    date: dateOuverture,
    libelle: "À-nouveaux",
    pieceRef: `AN-${dateOuverture.toISOString().slice(0, 10)}`,
    pieceDate: dateOuverture,
    exerciceId: newExerciceId,
    lignes,
  };
}

// ============================================================================
// Account balance extraction helpers
// ============================================================================

/** Get balance for a specific account from trial balance */
export function getAccountBalance(
  trialBalance: TrialBalance,
  compteNum: string,
): MonetaryAmount {
  const ligne = trialBalance.lignes.find((l) => l.compteNum === compteNum);
  if (!ligne) return ZERO;
  return subtract(ligne.totalDebit, ligne.totalCredit);
}

/** Get sum of balances for all accounts starting with prefix */
export function getAccountPrefixBalance(
  trialBalance: TrialBalance,
  prefix: string,
): MonetaryAmount {
  let total = ZERO;
  for (const ligne of trialBalance.lignes) {
    if (ligne.compteNum.startsWith(prefix)) {
      total = add(total, subtract(ligne.totalDebit, ligne.totalCredit));
    }
  }
  return total;
}

/** Get sum of debit balances for accounts starting with prefix */
export function getDebitBalance(
  trialBalance: TrialBalance,
  prefix: string,
): MonetaryAmount {
  let total = ZERO;
  for (const ligne of trialBalance.lignes) {
    if (ligne.compteNum.startsWith(prefix)) {
      total = add(total, ligne.soldeDebiteur);
    }
  }
  return total;
}

/** Get sum of credit balances for accounts starting with prefix */
export function getCreditBalance(
  trialBalance: TrialBalance,
  prefix: string,
): MonetaryAmount {
  let total = ZERO;
  for (const ligne of trialBalance.lignes) {
    if (ligne.compteNum.startsWith(prefix)) {
      total = add(total, ligne.soldeCrediteur);
    }
  }
  return total;
}
