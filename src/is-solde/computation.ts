import type { Monetary } from "monetary";
import { add, subtract, monetary, EUR } from "monetary";
import { computeIS } from "../liasse-fiscale/computation.js";
import type { Acompte, Form2572, Form2572Snapshot } from "./models.js";

const ZERO = (): Monetary<number> => monetary({ amount: 0, currency: EUR });

// ============================================================================
// 2572-SD Computation
// ============================================================================

export type Compute2572Input = {
  readonly siren: string;
  readonly denomination: string;
  readonly exerciceStart: Date;
  readonly exerciceEnd: Date;
  readonly isFirstExercise: boolean;
  readonly resultatFiscal: Monetary<number>;
  readonly acomptes?: readonly Acompte[];
};

export function compute2572(input: Compute2572Input): Form2572 {
  const isBrut = computeIS(input.resultatFiscal);

  const acomptes = input.acomptes ?? [];
  let totalAcomptes = ZERO();
  for (const a of acomptes) {
    totalAcomptes = add(totalAcomptes, a.montant);
  }

  const solde = subtract(isBrut, totalAcomptes);

  return {
    _tag: "Form2572",
    siren: input.siren,
    denomination: input.denomination,
    exerciceStart: input.exerciceStart,
    exerciceEnd: input.exerciceEnd,
    isFirstExercise: input.isFirstExercise,
    resultatFiscal: input.resultatFiscal,
    isBrut,
    acomptes,
    totalAcomptes,
    solde,
    isAPayer: solde.amount > 0 ? solde : ZERO(),
    excedent: solde.amount < 0 ? monetary({ amount: -solde.amount, currency: EUR }) : ZERO(),
  };
}

// ============================================================================
// Snapshot
// ============================================================================

export function create2572Snapshot(form: Form2572): Form2572Snapshot {
  return {
    _tag: "Form2572Snapshot",
    siren: form.siren,
    denomination: form.denomination,
    exerciceStart: form.exerciceStart.toISOString().slice(0, 10),
    exerciceEnd: form.exerciceEnd.toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    resultatFiscal: form.resultatFiscal.amount / 100,
    isBrut: form.isBrut.amount / 100,
    totalAcomptes: form.totalAcomptes.amount / 100,
    solde: form.solde.amount / 100,
    isAPayer: form.isAPayer.amount / 100,
    excedent: form.excedent.amount / 100,
  };
}
