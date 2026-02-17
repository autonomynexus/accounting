import { Effect, Layer } from "effect";
import type { ScaledAmount } from "monetary";
import type { ActivityType, RateType } from "../urssaf/rates";
import { UrssafRatesPort, RateNotFoundError } from "../ports";

/**
 * Keys should be formatted as `${ActivityType}:${RateType}`, e.g. "BNC:base"
 */
export function makeBespokeUrssafRatesLayer(
  rates: Map<string, ScaledAmount<number>>,
) {
  return Layer.succeed(
    UrssafRatesPort,
    UrssafRatesPort.of({
      getRate: (activityType: ActivityType, rateType: RateType, date: Date) => {
        const key = `${activityType}:${rateType}`;
        const rate = rates.get(key);
        if (rate === undefined) {
          return Effect.fail(
            new RateNotFoundError({
              activityType,
              rateType,
              date,
            }),
          );
        }
        return Effect.succeed(rate);
      },

      getAllRatesForActivity: (activityType: ActivityType, date: Date) => {
        const result = new Map<RateType, ScaledAmount<number>>();
        const rateTypes: RateType[] = ["base", "acre_year1", "versement_liberatoire", "cfp"];
        for (const rt of rateTypes) {
          const rate = rates.get(`${activityType}:${rt}`);
          if (rate !== undefined) {
            result.set(rt, rate);
          }
        }
        if (result.size === 0) {
          return Effect.fail(
            new RateNotFoundError({
              activityType,
              rateType: "all",
              date,
            }),
          );
        }
        return Effect.succeed(result);
      },
    }),
  );
}
