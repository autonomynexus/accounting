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
} from "../src/pcg/index.js";

describe("Full PCG Chart of Accounts", () => {
  it("has accounts for all 8 classes", () => {
    for (let cls = 1; cls <= 8; cls++) {
      const accounts = getAccountsByClass(cls as any);
      expect(accounts.length).toBeGreaterThan(0);
    }
  });

  it("has more than 300 accounts total", () => {
    expect(PCG_ACCOUNTS_FULL.length).toBeGreaterThan(300);
  });

  it("looks up account by code", () => {
    const acc = getAccountByCode("512");
    expect(acc).toBeDefined();
    expect(acc!.name).toBe("Banques");
    expect(acc!.class).toBe(5);
    expect(acc!.isDebitNormal).toBe(true);
  });

  it("finds child accounts", () => {
    const children = getChildAccounts("21");
    expect(children.length).toBeGreaterThan(3);
    expect(children.some((c) => c.code === "211")).toBe(true);
    expect(children.some((c) => c.code === "218")).toBe(true);
  });

  it("finds accounts by prefix", () => {
    const vatAccounts = getAccountsByPrefix("445");
    expect(vatAccounts.length).toBeGreaterThan(5);
  });

  it("builds account hierarchy", () => {
    const hierarchy = getAccountHierarchy("44566");
    expect(hierarchy.length).toBeGreaterThanOrEqual(3);
    expect(hierarchy[0]!.code).toBe("44"); // or 445
    expect(hierarchy[hierarchy.length - 1]!.code).toBe("44566");
  });

  it("validates PCG account codes", () => {
    expect(isValidPcgAccount("512")).toBe(true);
    expect(isValidPcgAccount("999999")).toBe(false);
  });

  it("finds leaf accounts", () => {
    const leaves = getLeafAccounts();
    expect(leaves.length).toBeGreaterThan(100);
    // Leaf accounts shouldn't have children
    for (const leaf of leaves.slice(0, 10)) {
      const children = getChildAccounts(leaf.code);
      expect(children.length).toBe(0);
    }
  });

  it("finds accounts by type", () => {
    const assets = getAccountsByType("ASSET");
    expect(assets.length).toBeGreaterThan(50);
    const revenues = getAccountsByType("REVENUE");
    expect(revenues.length).toBeGreaterThan(30);
  });

  it("has correct normal balance sides", () => {
    // Assets: debit normal
    expect(getAccountByCode("512")!.isDebitNormal).toBe(true);
    // Liabilities: credit normal
    expect(getAccountByCode("401")!.isDebitNormal).toBe(false);
    // Expenses: debit normal
    expect(getAccountByCode("607")!.isDebitNormal).toBe(true);
    // Revenue: credit normal
    expect(getAccountByCode("706")!.isDebitNormal).toBe(false);
    // Equity: credit normal
    expect(getAccountByCode("101")!.isDebitNormal).toBe(false);
  });
});
