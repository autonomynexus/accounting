import { describe, expect, it } from "vitest";
import { EUR, monetary } from "@autonomynexus/monetary";
import {
  validateEcriture,
  computeTrialBalance,
  computeGrandLivre,
  computeBalanceAuxiliaire,
  computeClotureExercice,
  computeANouveau,
  computeLettrage,
} from "../src/engine/index.js";
import type { EcritureComptable, CreateEcritureInput } from "../src/engine/index.js";

const m = (amount: number) => monetary({ amount, currency: EUR });

function makeEcriture(
  overrides: Partial<EcritureComptable> & { lignes: EcritureComptable["lignes"] },
): EcritureComptable {
  return {
    id: "1",
    journalCode: "VE",
    numero: "VE-001",
    date: new Date(2024, 0, 15),
    dateValidation: new Date(2024, 0, 15),
    libelle: "Test",
    pieceRef: "REF-001",
    pieceDate: new Date(2024, 0, 15),
    status: "VALIDEE",
    exerciceId: "2024",
    ...overrides,
  };
}

function makeLigne(compteNum: string, debit: number, credit: number) {
  return {
    id: `${compteNum}-${debit}-${credit}`,
    ecritureId: "1",
    compteNum,
    compteLib: compteNum,
    compteAuxNum: null,
    compteAuxLib: null,
    libelle: "test",
    debit: m(debit),
    credit: m(credit),
    lettrage: null,
    dateLettrage: null,
    echeance: null,
  };
}

describe("Écriture Validation", () => {
  it("accepts balanced entry with 2 lines", () => {
    const errors = validateEcriture({
      journalCode: "VE",
      date: new Date(),
      libelle: "Test",
      pieceRef: "REF",
      pieceDate: new Date(),
      exerciceId: "2024",
      lignes: [
        { compteNum: "512", debit: m(10000), credit: m(0) },
        { compteNum: "706", debit: m(0), credit: m(10000) },
      ],
    });
    expect(errors).toHaveLength(0);
  });

  it("rejects unbalanced entry", () => {
    const errors = validateEcriture({
      journalCode: "VE",
      date: new Date(),
      libelle: "Test",
      pieceRef: "REF",
      pieceDate: new Date(),
      exerciceId: "2024",
      lignes: [
        { compteNum: "512", debit: m(10000), credit: m(0) },
        { compteNum: "706", debit: m(0), credit: m(5000) },
      ],
    });
    expect(errors.some((e) => e.type === "UNBALANCED")).toBe(true);
  });

  it("rejects entry with less than 2 lines", () => {
    const errors = validateEcriture({
      journalCode: "VE",
      date: new Date(),
      libelle: "Test",
      pieceRef: "REF",
      pieceDate: new Date(),
      exerciceId: "2024",
      lignes: [{ compteNum: "512", debit: m(10000), credit: m(0) }],
    });
    expect(errors.some((e) => e.type === "NO_LINES")).toBe(true);
  });
});

describe("Trial Balance", () => {
  it("computes trial balance from journal entries", () => {
    const ecritures: EcritureComptable[] = [
      makeEcriture({
        lignes: [
          makeLigne("512", 10000, 0),
          makeLigne("706", 0, 10000),
        ],
      }),
      makeEcriture({
        id: "2",
        numero: "HA-001",
        journalCode: "HA",
        lignes: [
          makeLigne("606", 3000, 0),
          makeLigne("512", 0, 3000),
        ],
      }),
    ];

    const tb = computeTrialBalance(ecritures, "2024", new Date(2024, 0, 1), new Date(2024, 11, 31));

    expect(tb.isBalanced).toBe(true);
    expect(tb.lignes.length).toBe(3); // 512, 606, 706

    const bank = tb.lignes.find((l) => l.compteNum === "512")!;
    expect(bank.totalDebit.amount).toBe(10000);
    expect(bank.totalCredit.amount).toBe(3000);
    expect(bank.soldeDebiteur.amount).toBe(7000);
  });

  it("excludes cancelled entries", () => {
    const ecritures: EcritureComptable[] = [
      makeEcriture({
        status: "ANNULEE",
        lignes: [makeLigne("512", 10000, 0), makeLigne("706", 0, 10000)],
      }),
    ];

    const tb = computeTrialBalance(ecritures, "2024", new Date(2024, 0, 1), new Date(2024, 11, 31));
    expect(tb.lignes.length).toBe(0);
  });
});

describe("General Ledger", () => {
  it("computes general ledger with running balances", () => {
    const ecritures: EcritureComptable[] = [
      makeEcriture({
        lignes: [makeLigne("512", 10000, 0), makeLigne("706", 0, 10000)],
      }),
      makeEcriture({
        id: "2",
        numero: "HA-001",
        date: new Date(2024, 1, 1),
        lignes: [makeLigne("606", 2000, 0), makeLigne("512", 0, 2000)],
      }),
    ];

    const gl = computeGrandLivre(ecritures, "2024", new Date(2024, 0, 1), new Date(2024, 11, 31));

    const bankAccount = gl.accounts.find((a) => a.compteNum === "512")!;
    expect(bankAccount.entries.length).toBe(2);
    expect(bankAccount.soldeCloture.amount).toBe(8000); // 10000 - 2000
  });
});

describe("Subsidiary Ledger", () => {
  it("computes client subsidiary ledger", () => {
    const ecritures: EcritureComptable[] = [
      makeEcriture({
        lignes: [
          {
            ...makeLigne("411", 10000, 0),
            compteAuxNum: "CLI001",
            compteAuxLib: "Client A",
          },
          makeLigne("706", 0, 10000),
        ],
      }),
    ];

    const bal = computeBalanceAuxiliaire(ecritures, "CLIENTS", "2024", new Date(2024, 0, 1), new Date(2024, 11, 31));
    expect(bal.lignes.length).toBe(1);
    expect(bal.lignes[0]!.compteAuxNum).toBe("CLI001");
    expect(bal.lignes[0]!.solde.amount).toBe(10000);
  });
});

describe("Lettrage", () => {
  it("accepts balanced lettrage", () => {
    const lignes = [
      makeLigne("411", 10000, 0),
      makeLigne("411", 0, 10000),
    ];
    const result = computeLettrage(lignes, "AA");
    expect(result.success).toBe(true);
    expect(result.code).toBe("AA");
  });

  it("rejects unbalanced lettrage", () => {
    const lignes = [
      makeLigne("411", 10000, 0),
      makeLigne("411", 0, 5000),
    ];
    const result = computeLettrage(lignes, "AB");
    expect(result.success).toBe(false);
  });
});

describe("Clôture d'exercice", () => {
  it("generates closing entries and computes result", () => {
    const ecritures: EcritureComptable[] = [
      makeEcriture({
        lignes: [makeLigne("512", 10000, 0), makeLigne("706", 0, 10000)],
      }),
      makeEcriture({
        id: "2",
        lignes: [makeLigne("606", 3000, 0), makeLigne("512", 0, 3000)],
      }),
    ];

    const tb = computeTrialBalance(ecritures, "2024", new Date(2024, 0, 1), new Date(2024, 11, 31));
    const cloture = computeClotureExercice(tb, "2024", new Date(2024, 11, 31));

    // Résultat = 10000 (produits) - 3000 (charges) = 7000 (bénéfice)
    expect(cloture.resultat.amount).toBe(7000);
    expect(cloture.ecrituresCloture.length).toBe(1);
  });
});

describe("À-nouveau", () => {
  it("generates opening entries from balance sheet accounts", () => {
    const ecritures: EcritureComptable[] = [
      makeEcriture({
        lignes: [makeLigne("512", 10000, 0), makeLigne("706", 0, 10000)],
      }),
    ];

    const tb = computeTrialBalance(ecritures, "2024", new Date(2024, 0, 1), new Date(2024, 11, 31));
    const an = computeANouveau(tb, "2025", new Date(2025, 0, 1));

    // Only balance sheet account (512) should be carried forward, not 706
    expect(an.lignes.some((l) => l.compteNum === "512")).toBe(true);
    expect(an.lignes.some((l) => l.compteNum === "706")).toBe(false);
  });
});
