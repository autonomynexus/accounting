import { Effect, Schema } from "effect";
// ============================================================================
// Tagged Errors
// ============================================================================
export class RateNotFoundError extends Schema.TaggedError()("RateNotFoundError", {
    activityType: Schema.String,
    rateType: Schema.String,
    date: Schema.DateFromSelf,
}) {
}
// ============================================================================
// Port Tag
// ============================================================================
export class UrssafRatesPort extends Effect.Tag("@accounting/UrssafRatesPort")() {
}
//# sourceMappingURL=urssaf-rates.port.js.map