import { Effect, Layer } from "effect";
import { UrssafRatesPort, RateNotFoundError } from "../ports";
/**
 * Keys should be formatted as `${ActivityType}:${RateType}`, e.g. "BNC:base"
 */
export function makeBespokeUrssafRatesLayer(rates) {
    return Layer.succeed(UrssafRatesPort, UrssafRatesPort.of({
        getRate: (activityType, rateType, date) => {
            const key = `${activityType}:${rateType}`;
            const rate = rates.get(key);
            if (rate === undefined) {
                return Effect.fail(new RateNotFoundError({
                    activityType,
                    rateType,
                    date,
                }));
            }
            return Effect.succeed(rate);
        },
        getAllRatesForActivity: (activityType, date) => {
            const result = new Map();
            const rateTypes = ["base", "acre_year1", "versement_liberatoire", "cfp"];
            for (const rt of rateTypes) {
                const rate = rates.get(`${activityType}:${rt}`);
                if (rate !== undefined) {
                    result.set(rt, rate);
                }
            }
            if (result.size === 0) {
                return Effect.fail(new RateNotFoundError({
                    activityType,
                    rateType: "all",
                    date,
                }));
            }
            return Effect.succeed(result);
        },
    }));
}
//# sourceMappingURL=urssaf-rates.bespoke.js.map