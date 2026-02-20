import { Effect, Schema } from "effect";
import type { ScaledAmount } from "monetary";
import type { ActivityType, RateType } from "../urssaf/rates";
declare const RateNotFoundError_base: Schema.TaggedErrorClass<RateNotFoundError, "RateNotFoundError", {
    readonly _tag: Schema.tag<"RateNotFoundError">;
} & {
    activityType: typeof Schema.String;
    rateType: typeof Schema.String;
    date: typeof Schema.DateFromSelf;
}>;
export declare class RateNotFoundError extends RateNotFoundError_base {
}
export type UrssafRatesPortInterface = {
    /** Get the applicable rate for a given activity type, rate type, and date */
    readonly getRate: (activityType: ActivityType, rateType: RateType, date: Date) => Effect.Effect<ScaledAmount<number>, RateNotFoundError>;
    /** Get all rates for an activity type at a given date */
    readonly getAllRatesForActivity: (activityType: ActivityType, date: Date) => Effect.Effect<Map<RateType, ScaledAmount<number>>, RateNotFoundError>;
};
declare const UrssafRatesPort_base: import("effect/Context").TagClass<UrssafRatesPort, "@accounting/UrssafRatesPort", UrssafRatesPortInterface> & Effect.Tag.Proxy<UrssafRatesPort, UrssafRatesPortInterface> & {
    use: <X>(body: (_: UrssafRatesPortInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | UrssafRatesPort> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, UrssafRatesPort> : Effect.Effect<X, never, UrssafRatesPort>;
};
export declare class UrssafRatesPort extends UrssafRatesPort_base {
}
export {};
//# sourceMappingURL=urssaf-rates.port.d.ts.map