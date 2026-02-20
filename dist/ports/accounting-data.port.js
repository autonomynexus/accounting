import { Effect, Schema } from "effect";
// ============================================================================
// Tagged Errors
// ============================================================================
export class AccountingDataError extends Schema.TaggedError()("AccountingDataError", {
    operation: Schema.String,
    details: Schema.Unknown,
}) {
}
// ============================================================================
// Port Tag
// ============================================================================
export class AccountingDataPort extends Effect.Tag("@accounting/AccountingDataPort")() {
}
//# sourceMappingURL=accounting-data.port.js.map