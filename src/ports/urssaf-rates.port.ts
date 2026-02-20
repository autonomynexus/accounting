import { Effect, Schema } from "effect";
import type { ScaledAmount } from "@autonomynexus/monetary";
import type { ActivityType, RateType } from "../urssaf/rates";

// ============================================================================
// Tagged Errors
// ============================================================================

export class RateNotFoundError extends Schema.TaggedError<RateNotFoundError>()(
  "RateNotFoundError",
  {
    activityType: Schema.String,
    rateType: Schema.String,
    date: Schema.DateFromSelf,
  },
) {}

// ============================================================================
// Port Interface
// ============================================================================

export type UrssafRatesPortInterface = {
  /** Get the applicable rate for a given activity type, rate type, and date */
  readonly getRate: (
    activityType: ActivityType,
    rateType: RateType,
    date: Date,
  ) => Effect.Effect<ScaledAmount<number>, RateNotFoundError>;

  /** Get all rates for an activity type at a given date */
  readonly getAllRatesForActivity: (
    activityType: ActivityType,
    date: Date,
  ) => Effect.Effect<Map<RateType, ScaledAmount<number>>, RateNotFoundError>;
};

// ============================================================================
// Port Tag
// ============================================================================

export class UrssafRatesPort extends Effect.Tag("@accounting/UrssafRatesPort")<
  UrssafRatesPort,
  UrssafRatesPortInterface
>() {}
