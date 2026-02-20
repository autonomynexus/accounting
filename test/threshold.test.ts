import { describe, it, expect } from "vitest";
import { Effect, Layer } from "effect";
import { EUR, monetary } from "@autonomynexus/monetary";
import type { AccountBalance } from "../src/models";
import { AccountingDataPort } from "../src/ports";
import {
  ThresholdMonitoringService,
  ThresholdMonitoringServiceLayer,
} from "../src/threshold/service";

const m = (amount: number) => monetary({ amount, currency: EUR });

function makeRevenueBalances(amount: number): AccountBalance[] {
  return [
    {
      accountCode: "706",
      debitTotal: m(0),
      creditTotal: m(amount),
      balance: m(amount),
    },
  ];
}

function buildTestLayer(currentYearRevenue: number, previousYearRevenue: number) {
  const dataLayer = Layer.succeed(
    AccountingDataPort,
    AccountingDataPort.of({
      getAccountBalancesByClass: (_userId, period, accountClass) => {
        if (accountClass !== 7) return Effect.succeed([]);
        const year = period.startDate.getFullYear();
        if (year === 2025) return Effect.succeed(makeRevenueBalances(currentYearRevenue));
        if (year === 2024) return Effect.succeed(makeRevenueBalances(previousYearRevenue));
        return Effect.succeed([]);
      },
      getAccountBalances: () => Effect.succeed([]),
      findJournalEntriesByPeriod: () => Effect.succeed([]),
      findJournalLinesByEntryIds: () => Effect.succeed([]),
    }),
  );

  return ThresholdMonitoringServiceLayer.pipe(Layer.provide(dataLayer));
}

describe("ThresholdMonitoringService", () => {
  const activityStart = new Date(2020, 0, 1);

  it("returns no warnings when below threshold", async () => {
    const layer = buildTestLayer(2000_00, 1000_00);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* ThresholdMonitoringService;
        return yield* svc.getThresholdStatus("user1", "BNC", 2025, activityStart);
      }).pipe(Effect.provide(layer)),
    );

    expect(result.warnings).toHaveLength(0);
    expect(result.currentYearExceeded).toBe(false);
    expect(result.regimeAtRisk).toBe(false);
  });

  it("warns when approaching micro threshold (80%+)", async () => {
    // 80% of 77700€ (7770000 cents) = 6216000
    const layer = buildTestLayer(6500000, 1000_00);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* ThresholdMonitoringService;
        return yield* svc.getThresholdStatus("user1", "BNC", 2025, activityStart);
      }).pipe(Effect.provide(layer)),
    );

    const microWarning = result.warnings.find((w) => w.type === "approaching_micro");
    expect(microWarning).toBeDefined();
    expect(result.currentYearExceeded).toBe(false);
  });

  it("warns when exceeding micro threshold", async () => {
    const layer = buildTestLayer(8000000, 1000_00);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* ThresholdMonitoringService;
        return yield* svc.getThresholdStatus("user1", "BNC", 2025, activityStart);
      }).pipe(Effect.provide(layer)),
    );

    const exceededWarning = result.warnings.find((w) => w.type === "exceeded_micro");
    expect(exceededWarning).toBeDefined();
    expect(result.currentYearExceeded).toBe(true);
  });

  it("warns regime transition risk when exceeded 2 consecutive years", async () => {
    const layer = buildTestLayer(8000000, 8000000);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const svc = yield* ThresholdMonitoringService;
        return yield* svc.getThresholdStatus("user1", "BNC", 2025, activityStart);
      }).pipe(Effect.provide(layer)),
    );

    expect(result.regimeAtRisk).toBe(true);
    const riskWarning = result.warnings.find((w) => w.type === "regime_transition_risk");
    expect(riskWarning).toBeDefined();
  });
});
