import { describe, expect, it } from "vitest";
import { EUR, monetary } from "@autonomynexus/monetary";
import { isPMEEligible, deriveISEligibilityFlags, type CompanyStructure, type Shareholder } from "../src/models/company-structure.js";

const m = (euros: number) => monetary({ amount: euros * 100, currency: EUR });

function makeStructure(overrides: Partial<CompanyStructure> = {}): CompanyStructure {
  return {
    capitalSocial: m(10000),
    capitalLibere: m(10000),
    shareholders: [
      { name: "Kevin", type: "natural_person" as const, sharePercentage: 100 },
    ],
    effectifMoyen: 1,
    totalBilan: m(50000),
    chiffreAffairesHT: m(100000),
    ...overrides,
  };
}

describe("isPMEEligible", () => {
  it("small single-owner company is eligible", () => {
    const result = isPMEEligible(makeStructure());
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(5);
    expect(result.reasons.every((r) => r.startsWith("OK: "))).toBe(true);
  });

  it("ineligible when CA >= 10M", () => {
    const result = isPMEEligible(makeStructure({ chiffreAffairesHT: m(10_000_000) }));
    expect(result.eligible).toBe(false);
    expect(result.reasons[0]).toContain("FAIL: ");
    expect(result.reasons[0]).toContain("CA HT");
  });

  it("ineligible when capital not fully paid up", () => {
    const result = isPMEEligible(makeStructure({ capitalLibere: m(5000) }));
    expect(result.eligible).toBe(false);
    expect(result.reasons[1]).toContain("FAIL: ");
    expect(result.reasons[1]).toContain("libéré");
  });

  it("ineligible when <75% natural persons", () => {
    const shareholders: Shareholder[] = [
      { name: "Holding SAS", type: "legal_entity", sharePercentage: 60 },
      { name: "Kevin", type: "natural_person", sharePercentage: 40 },
    ];
    const result = isPMEEligible(makeStructure({ shareholders }));
    expect(result.eligible).toBe(false);
    expect(result.reasons[2]).toContain("FAIL: ");
    expect(result.reasons[2]).toContain("40.0%");
  });

  it("eligible at exactly 75% natural persons", () => {
    const shareholders: Shareholder[] = [
      { name: "Holding", type: "legal_entity", sharePercentage: 25 },
      { name: "Kevin", type: "natural_person", sharePercentage: 75 },
    ];
    const result = isPMEEligible(makeStructure({ shareholders }));
    expect(result.eligible).toBe(true);
  });

  it("shows EU PME warnings for headcount >= 50", () => {
    const result = isPMEEligible(makeStructure({ effectifMoyen: 55 }));
    // Still eligible for CGI 219-I-b (EU PME is informational)
    expect(result.eligible).toBe(true);
    expect(result.reasons[3]).toContain("WARN: ");
    expect(result.reasons[3]).toContain("55");
  });

  it("shows EU PME warnings for total bilan >= 10M", () => {
    const result = isPMEEligible(makeStructure({ totalBilan: m(15_000_000) }));
    expect(result.eligible).toBe(true);
    expect(result.reasons[4]).toContain("WARN: ");
  });

  it("multiple conditions can fail simultaneously", () => {
    const result = isPMEEligible(makeStructure({
      chiffreAffairesHT: m(20_000_000),
      capitalLibere: m(0),
      shareholders: [{ name: "Corp", type: "legal_entity", sharePercentage: 100 }],
    }));
    expect(result.eligible).toBe(false);
    const failures = result.reasons.filter((r) => r.startsWith("FAIL: "));
    expect(failures).toHaveLength(3);
  });
});

describe("deriveISEligibilityFlags", () => {
  it("derives true flags for fully-paid natural-person-owned company", () => {
    const flags = deriveISEligibilityFlags(makeStructure());
    expect(flags.capitalEntierementLibere).toBe(true);
    expect(flags.detenuParPersonnesPhysiques75).toBe(true);
  });

  it("derives false flags when capital not libéré", () => {
    const flags = deriveISEligibilityFlags(makeStructure({ capitalLibere: m(5000) }));
    expect(flags.capitalEntierementLibere).toBe(false);
  });

  it("derives false flags when <75% natural persons", () => {
    const flags = deriveISEligibilityFlags(makeStructure({
      shareholders: [{ name: "Corp", type: "legal_entity", sharePercentage: 100 }],
    }));
    expect(flags.detenuParPersonnesPhysiques75).toBe(false);
  });
});
