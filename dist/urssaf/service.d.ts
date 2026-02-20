import { Effect, Layer, Schema } from "effect";
import { AccountingDataPort, AccountingDataError, UrssafRatesPort, RateNotFoundError } from "../ports";
import type { ComputeUrssafDeclarationInput, RevenueBreakdown, UrssafDeclarationResult } from "./models";
declare const NoRevenueDataError_base: Schema.TaggedErrorClass<NoRevenueDataError, "NoRevenueDataError", {
    readonly _tag: Schema.tag<"NoRevenueDataError">;
} & {
    period: typeof Schema.Unknown;
}>;
export declare class NoRevenueDataError extends NoRevenueDataError_base {
}
export type UrssafServiceInterface = {
    readonly computeDeclaration: (input: ComputeUrssafDeclarationInput) => Effect.Effect<UrssafDeclarationResult, NoRevenueDataError | RateNotFoundError | AccountingDataError>;
    readonly computeDeclarationsBatch: (inputs: readonly ComputeUrssafDeclarationInput[]) => Effect.Effect<readonly UrssafDeclarationResult[], NoRevenueDataError | RateNotFoundError | AccountingDataError>;
    readonly getRevenueBreakdown: (input: Pick<ComputeUrssafDeclarationInput, "userId" | "period">) => Effect.Effect<RevenueBreakdown, AccountingDataError>;
};
declare const UrssafService_base: import("effect/Context").TagClass<UrssafService, "@accounting/UrssafService", UrssafServiceInterface> & Effect.Tag.Proxy<UrssafService, UrssafServiceInterface> & {
    use: <X>(body: (_: UrssafServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | UrssafService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, UrssafService> : Effect.Effect<X, never, UrssafService>;
};
export declare class UrssafService extends UrssafService_base {
}
export declare const UrssafServiceLayer: Layer.Layer<UrssafService, never, AccountingDataPort | UrssafRatesPort>;
export {};
//# sourceMappingURL=service.d.ts.map