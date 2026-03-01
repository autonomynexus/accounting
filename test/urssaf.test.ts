import { describe, it, expect } from "vitest";
import { Effect, Layer } from "effect";
import { EUR, monetary, equal } from "@autonomynexus/monetary";
import type { ScaledAmount, Monetary } from "@autonomynexus/monetary";
import type { AccountBalance } from "../src/models";
import { AccountingDataPort } from "../src/ports";
import { makeBespokeUrssafRatesLayer } from "../src/bespoke";
import { UrssafService, UrssafServiceLayer } from "../src/urssaf/service";
import { getAcreRateType, isAcreActive } from "../src/urssaf/rates";

const m = (amount: number) => monetary({ amount, currency: EUR });
const sa = (amount: number, scale: number): ScaledAmount<number> => ({ amount, scale });

function expectM(actual: Monetary<number>, expectedCents: number) {
  expect(equal(actual, m(expectedCents))).toBe(true);
}

const standardRates = new Map<string, ScaledAmount<number>>([
  ["BNC:base", sa(220, 3)], // 22.0%
  ["BNC:acre_year1", sa(110, 3)], // 11.0% (50% exonération)
  ["BNC:acre_post_july2026", sa(165, 3)], // 16.5% (25% exonération)
  ["BNC:cfp", sa(2, 3)], // 0.2%
  ["BNC:versement_liberatoire", sa(22, 3)], // 2.2%
]);

function makeDataLayer(revenue: number, expenses: number) {
  const revenueBalances: AccountBalance[] = [
    { accountCode: "706", debitTotal: m(0), creditTotal: m(revenue), balance: m(revenue) },
  ];
  const expenseBalances: AccountBalance[] = [
    { accountCode: "601", debitTotal: m(expenses), creditTotal: m(0), balance: m(expenses) },
  ];

  return Layer.succeed(
    AccountingDataPort,
    AccountingDataPort.of({
      getAccountBalancesByClass: (_userId, _period, accountClass) => {
        if (accountClass === 7) return Effect.succeed(revenueBalances);
        if (accountClass === 6) return Effect.succeed(expenseBalances);
        return Effect.succeed([]);
      },
      getAccountBalances: () => Effect.succeed([]),
      findJournalEntriesByPeriod: () => Effect.succeed([]),
      findJournalLinesByEntryIds: () => Effect.succeed([]),
    }),
  );
}

const period = {
  startDate: new Date(2025, 0, 1),
  endDate: new Date(2025, 2, 31),
};

describe("UrssafService", () => {
  it("computes declaration for micro regime with base rates", async () => {
    const dataLayer = makeDataLayer(10000_00, 3000_00);
    const ratesLayer = makeBespokeUrssafRatesLayer(standardRates);
    const layer = UrssafServiceLayer.pipe(Layer.provide(Layer.merge(dataLayer, ratesLayer)));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* UrssafService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period,
          activityType: "BNC",
          hasAcre: false,
          activityStartDate: new Date(2025, 0, 1),
          hasVersementLiberatoire: false,
          regimeCode: "micro",
        });
      }).pipe(Effect.provide(layer)),
    );

    expectM(result.declarationBase, 10000_00);
    expectM(result.contributions.baseContribution, 2200_00); // 22%
    expectM(result.contributions.cfpContribution, 20_00); // 0.2%
    expect(result.contributions.versementLiberatoire).toBeNull();
    expectM(result.contributions.totalContribution, 2220_00);
  });

  it("computes declaration with ACRE rates", async () => {
    const dataLayer = makeDataLayer(10000_00, 3000_00);
    const ratesLayer = makeBespokeUrssafRatesLayer(standardRates);
    const layer = UrssafServiceLayer.pipe(Layer.provide(Layer.merge(dataLayer, ratesLayer)));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* UrssafService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period,
          activityType: "BNC",
          hasAcre: true,
          activityStartDate: new Date(2025, 0, 1),
          hasVersementLiberatoire: false,
          regimeCode: "micro",
        });
      }).pipe(Effect.provide(layer)),
    );

    expectM(result.contributions.baseContribution, 1100_00); // 11% (pre-reform ACRE)
  });

  it("includes versement liberatoire when enabled", async () => {
    const dataLayer = makeDataLayer(10000_00, 3000_00);
    const ratesLayer = makeBespokeUrssafRatesLayer(standardRates);
    const layer = UrssafServiceLayer.pipe(Layer.provide(Layer.merge(dataLayer, ratesLayer)));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* UrssafService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period,
          activityType: "BNC",
          hasAcre: false,
          activityStartDate: new Date(2025, 0, 1),
          hasVersementLiberatoire: true,
          regimeCode: "micro",
        });
      }).pipe(Effect.provide(layer)),
    );

    expect(result.contributions.versementLiberatoire).not.toBeNull();
    expectM(result.contributions.versementLiberatoire!, 220_00); // 2.2%
    expectM(result.contributions.totalContribution, 2440_00); // 2200 + 20 + 220
  });

  it("gets revenue breakdown", async () => {
    const dataLayer = makeDataLayer(10000_00, 3000_00);
    const ratesLayer = makeBespokeUrssafRatesLayer(standardRates);
    const layer = UrssafServiceLayer.pipe(Layer.provide(Layer.merge(dataLayer, ratesLayer)));

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* UrssafService;
        return yield* svc.getRevenueBreakdown({ userId: "user1", period });
      }).pipe(Effect.provide(layer)),
    );

    expectM(result.revenueTotal, 10000_00);
    expectM(result.expenseTotal, 3000_00);
  });

  it("computes declaration with post-July 2026 ACRE rates (reduced exonération)", async () => {
    const dataLayer = makeDataLayer(10000_00, 3000_00);
    const ratesLayer = makeBespokeUrssafRatesLayer(standardRates);
    const layer = UrssafServiceLayer.pipe(Layer.provide(Layer.merge(dataLayer, ratesLayer)));

    const postReformPeriod = {
      startDate: new Date(2026, 9, 1), // Oct 2026
      endDate: new Date(2026, 11, 31),
    };

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* UrssafService;
        return yield* svc.computeDeclaration({
          userId: "user1",
          period: postReformPeriod,
          activityType: "BNC",
          hasAcre: true,
          activityStartDate: new Date(2026, 7, 1), // Aug 2026 — post-reform
          hasVersementLiberatoire: false,
          regimeCode: "micro",
        });
      }).pipe(Effect.provide(layer)),
    );

    expectM(result.contributions.baseContribution, 1650_00); // 16.5% (75% of 22%)
  });
});

describe("getAcreRateType", () => {
  it("returns 'base' when hasAcre is false", () => {
    expect(getAcreRateType(false)).toBe("base");
    expect(getAcreRateType(false, new Date(2026, 8, 1))).toBe("base");
  });

  it("returns 'acre_year1' for pre-July 2026 activity start", () => {
    expect(getAcreRateType(true, new Date(2025, 0, 1))).toBe("acre_year1");
    expect(getAcreRateType(true, new Date(2026, 5, 30))).toBe("acre_year1"); // June 30, 2026
  });

  it("returns 'acre_post_july2026' for activity starting on or after July 1, 2026", () => {
    expect(getAcreRateType(true, new Date(2026, 6, 1))).toBe("acre_post_july2026"); // exactly July 1
    expect(getAcreRateType(true, new Date(2026, 7, 15))).toBe("acre_post_july2026");
    expect(getAcreRateType(true, new Date(2027, 0, 1))).toBe("acre_post_july2026");
  });

  it("returns 'acre_year1' when no activityStartDate provided (backward compat)", () => {
    expect(getAcreRateType(true)).toBe("acre_year1");
  });
});
