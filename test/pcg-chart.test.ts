import { describe, expect, it } from "vitest";
import {
  PCG_ACCOUNTS_FULL,
  getAccountByCode,
  getAccountsByClass,
  getChildAccounts,
  getAccountsByPrefix,
  getAccountHierarchy,
  isValidPcgAccount,
  getLeafAccounts,
  getAccountsByType,
  type PcgAccountDefinition,
} from "../src/pcg/index.js";

describe("Full PCG Chart of Accounts", () => {
  // ========================================================================
  // Structural integrity
  // ========================================================================

  it("has accounts for all 8 classes", () => {
    for (let cls = 1; cls <= 8; cls++) {
      const accounts = getAccountsByClass(cls as any);
      expect(accounts.length, `Class ${cls} should have accounts`).toBeGreaterThan(0);
    }
  });

  it("has no duplicate account codes", () => {
    const codes = PCG_ACCOUNTS_FULL.map((a) => a.code);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });

  it("every parentCode references an existing account", () => {
    const allCodes = new Set(PCG_ACCOUNTS_FULL.map((a) => a.code));
    for (const acc of PCG_ACCOUNTS_FULL) {
      if (acc.parentCode !== null) {
        expect(allCodes.has(acc.parentCode), `Parent ${acc.parentCode} of ${acc.code} must exist`).toBe(true);
      }
    }
  });

  it("child account code starts with parent code", () => {
    for (const acc of PCG_ACCOUNTS_FULL) {
      if (acc.parentCode !== null) {
        expect(
          acc.code.startsWith(acc.parentCode),
          `Account ${acc.code} should start with parent ${acc.parentCode}`,
        ).toBe(true);
      }
    }
  });

  it("has PCG article citations for all accounts", () => {
    const withoutCitation = PCG_ACCOUNTS_FULL.filter((a) => !a.pcgArticle);
    expect(withoutCitation).toHaveLength(0);
  });

  // ========================================================================
  // Exact account verification against PCG regulation text
  // ========================================================================

  describe("Class 1 — Capitaux (Art. 941-10 to 941-18)", () => {
    it("has 101 Capital social / Capital individuel", () => {
      const acc = getAccountByCode("101")!;
      expect(acc.name).toBe("Capital social / Capital individuel");
      expect(acc.class).toBe(1);
      expect(acc.typeId).toBe("EQUITY");
      expect(acc.isDebitNormal).toBe(false); // credit normal
      expect(acc.pcgArticle).toBe("941-10");
    });

    it("has 108 Compte de l'exploitant (Art. 941-10 §I)", () => {
      const acc = getAccountByCode("108")!;
      expect(acc.name).toBe("Compte de l'exploitant");
      expect(acc.isDebitNormal).toBe(false);
    });

    it("has 109 as debit-normal contra-equity (Art. 941-10)", () => {
      const acc = getAccountByCode("109")!;
      expect(acc.isDebitNormal).toBe(true);
    });

    it("has 119 Report à nouveau (solde débiteur) as debit-normal", () => {
      const acc = getAccountByCode("119")!;
      expect(acc.isDebitNormal).toBe(true);
    });

    it("has 129 Résultat perte as debit-normal", () => {
      const acc = getAccountByCode("129")!;
      expect(acc.isDebitNormal).toBe(true);
    });

    it("has provisions réglementées 142-148 (Art. 941-14)", () => {
      expect(getAccountByCode("142")).toBeDefined();
      expect(getAccountByCode("145")!.name).toBe("Amortissements dérogatoires");
      expect(getAccountByCode("146")!.name).toBe("Provision spéciale de réévaluation");
      expect(getAccountByCode("147")!.name).toBe("Plus-values réinvesties");
    });

    it("has provisions pour risques 151-158 (Art. 941-15)", () => {
      expect(getAccountByCode("151")!.typeId).toBe("LIABILITY");
      expect(getAccountByCode("155")!.name).toBe("Provisions pour impôts");
    });

    it("has emprunts 161-169 (Art. 941-16)", () => {
      expect(getAccountByCode("164")!.name).toBe("Emprunts auprès des établissements de crédit");
      // 169 is contra-liability (debit normal)
      expect(getAccountByCode("169")!.isDebitNormal).toBe(true);
    });
  });

  describe("Class 2 — Immobilisations (Art. 942)", () => {
    it("has immobilisations incorporelles 201-208 (Art. 942-20)", () => {
      expect(getAccountByCode("201")!.name).toBe("Frais d'établissement");
      expect(getAccountByCode("205")!.name).toContain("Concessions");
      expect(getAccountByCode("207")!.name).toBe("Fonds commercial");
    });

    it("has terrains subdivisions (Art. 942-21)", () => {
      expect(getAccountByCode("2111")!.name).toBe("Terrains nus");
      expect(getAccountByCode("2115")!.name).toBe("Terrains bâtis");
    });

    it("has matériel informatique at 2183 (Art. 942-21)", () => {
      expect(getAccountByCode("2183")!.name).toBe("Matériel de bureau et matériel informatique");
    });

    it("has amortissements as credit-normal contra-assets (Art. 942-28)", () => {
      const amort = getAccountByCode("281")!;
      expect(amort.isDebitNormal).toBe(false); // credit normal
      expect(amort.class).toBe(2);
    });

    it("has dépréciations as credit-normal (Art. 942-29)", () => {
      expect(getAccountByCode("290")!.isDebitNormal).toBe(false);
      expect(getAccountByCode("296")!.isDebitNormal).toBe(false);
    });
  });

  describe("Class 4 — Tiers (Art. 944)", () => {
    it("has fournisseurs as credit-normal (Art. 944-40)", () => {
      expect(getAccountByCode("401")!.isDebitNormal).toBe(false);
      expect(getAccountByCode("404")!.name).toBe("Fournisseurs d'immobilisations");
    });

    it("has fournisseurs débiteurs 409x as debit-normal (Art. 944-40)", () => {
      expect(getAccountByCode("409")!.isDebitNormal).toBe(true);
      expect(getAccountByCode("4091")!.isDebitNormal).toBe(true);
    });

    it("has clients as debit-normal (Art. 944-41)", () => {
      expect(getAccountByCode("411")!.isDebitNormal).toBe(true);
      expect(getAccountByCode("416")!.name).toBe("Clients douteux ou litigieux");
    });

    it("has clients créditeurs 419x as credit-normal (Art. 944-41)", () => {
      expect(getAccountByCode("419")!.isDebitNormal).toBe(false);
      expect(getAccountByCode("4191")!.isDebitNormal).toBe(false);
    });

    it("has 4284 Dettes provisionnées pour participation (Art. 944-42)", () => {
      expect(getAccountByCode("4284")).toBeDefined();
    });

    it("has TVA accounts per Art. 944-44", () => {
      expect(getAccountByCode("4452")!.name).toBe("TVA due intracommunautaire");
      expect(getAccountByCode("4456")!.isDebitNormal).toBe(true); // créance
      expect(getAccountByCode("44562")!.name).toBe("TVA sur immobilisations");
      expect(getAccountByCode("44566")!.name).toBe("TVA sur autres biens et services");
      expect(getAccountByCode("44568")!.name).toBe("Taxes assimilées à la TVA");
      expect(getAccountByCode("4457")!.isDebitNormal).toBe(false); // dette
    });

    it("has 519 concours bancaires as credit-normal (Art. 945-51)", () => {
      // PCG explicitly says 519 is NOT in 164, it's separate
      expect(getAccountByCode("519")!.isDebitNormal).toBe(false);
    });
  });

  describe("Class 6 — Charges (Art. 946)", () => {
    it("has 609 rabais as credit-normal contra-expense", () => {
      expect(getAccountByCode("609")!.isDebitNormal).toBe(false);
    });

    it("has 619 and 629 as credit-normal contra-expenses", () => {
      expect(getAccountByCode("619")!.isDebitNormal).toBe(false);
      expect(getAccountByCode("629")!.isDebitNormal).toBe(false);
    });

    it("has 6225 Rémunérations d'affacturage (Art. 946-61/62)", () => {
      expect(getAccountByCode("6225")!.name).toBe("Rémunérations d'affacturage");
    });

    it("has IS accounts under 695 (Art. 946-69)", () => {
      expect(getAccountByCode("695")!.name).toBe("Impôts sur les bénéfices");
      expect(getAccountByCode("6951")!.name).toBe("Impôts dus en France");
    });

    it("has 699 as credit-normal (produit in charges class, Art. 946-69)", () => {
      expect(getAccountByCode("699")!.isDebitNormal).toBe(false);
    });

    it("has 6989 intégration fiscale produits as credit-normal", () => {
      expect(getAccountByCode("6989")!.isDebitNormal).toBe(false);
    });
  });

  describe("Class 7 — Produits (Art. 947)", () => {
    it("has 709 rabais accordés as debit-normal contra-revenue", () => {
      expect(getAccountByCode("709")!.isDebitNormal).toBe(true);
      expect(getAccountByCode("7097")!.isDebitNormal).toBe(true);
    });

    it("has 73 Produits nets partiels (Art. 947)", () => {
      expect(getAccountByCode("73")).toBeDefined();
    });

    it("has 777 Quote-part subventions virée au résultat (Art. 947-77)", () => {
      expect(getAccountByCode("777")!.name).toBe(
        "Quote-part des subventions d'investissement virée au résultat de l'exercice",
      );
    });
  });

  describe("Class 8 — Comptes spéciaux (Art. 948)", () => {
    it("has engagement subdivisions with 5-digit codes (Art. 948-80)", () => {
      expect(getAccountByCode("80161")!.name).toBe("Crédit-bail mobilier");
      expect(getAccountByCode("80165")!.name).toBe("Crédit-bail immobilier");
      expect(getAccountByCode("80261")!.name).toBe("Crédit-bail mobilier");
      expect(getAccountByCode("80265")!.name).toBe("Crédit-bail immobilier");
    });

    it("has contrepartie accounts 8091/8092 (Art. 948-80)", () => {
      expect(getAccountByCode("8091")!.name).toBe("Contrepartie 801");
      expect(getAccountByCode("8092")!.name).toBe("Contrepartie 802");
    });
  });

  // ========================================================================
  // Lookup function tests
  // ========================================================================

  it("getAccountByCode returns undefined for non-existent code", () => {
    expect(getAccountByCode("999999")).toBeUndefined();
  });

  it("getChildAccounts returns correct children", () => {
    const children = getChildAccounts("21");
    const childCodes = children.map((c) => c.code);
    expect(childCodes).toContain("211");
    expect(childCodes).toContain("212");
    expect(childCodes).toContain("213");
    expect(childCodes).toContain("218");
  });

  it("getAccountsByPrefix finds all VAT-related accounts", () => {
    const vatAccounts = getAccountsByPrefix("445");
    expect(vatAccounts.length).toBeGreaterThanOrEqual(10);
  });

  it("getAccountHierarchy returns full path", () => {
    const hierarchy = getAccountHierarchy("44566");
    const codes = hierarchy.map((h) => h.code);
    expect(codes).toContain("445");
    expect(codes).toContain("4456");
    expect(codes[codes.length - 1]).toBe("44566");
  });

  it("isValidPcgAccount works correctly", () => {
    expect(isValidPcgAccount("512")).toBe(true);
    expect(isValidPcgAccount("INVALID")).toBe(false);
  });

  it("getLeafAccounts excludes parent accounts", () => {
    const leaves = getLeafAccounts();
    // 512 has children (5121, 5124), so it should NOT be a leaf
    expect(leaves.some((l) => l.code === "512")).toBe(false);
    // 5121 has no children, so it SHOULD be a leaf
    expect(leaves.some((l) => l.code === "5121")).toBe(true);
  });
});
