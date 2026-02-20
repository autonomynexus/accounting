import { Effect, Layer, Schema } from "effect";
import { AccountingDataPort, type AccountingDataError } from "../ports";
import type { ComputeVatDeclarationInput, VatDeclarationResult } from "./models";
declare const InvalidVatCodeError_base: Schema.TaggedErrorClass<InvalidVatCodeError, "InvalidVatCodeError", {
    readonly _tag: Schema.tag<"InvalidVatCodeError">;
} & {
    vatCode: Schema.NullOr<typeof Schema.String>;
    accountCode: typeof Schema.String;
    journalLineId: typeof Schema.Number;
}>;
export declare class InvalidVatCodeError extends InvalidVatCodeError_base {
}
export type VatServiceInterface = {
    readonly computeDeclaration: (input: ComputeVatDeclarationInput) => Effect.Effect<VatDeclarationResult, AccountingDataError | InvalidVatCodeError>;
    readonly computeDeclarationsBatch: (inputs: readonly ComputeVatDeclarationInput[]) => Effect.Effect<readonly VatDeclarationResult[], AccountingDataError | InvalidVatCodeError>;
};
declare const VatService_base: import("effect/Context").TagClass<VatService, "@accounting/VatService", VatServiceInterface> & Effect.Tag.Proxy<VatService, VatServiceInterface> & {
    use: <X>(body: (_: VatServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | VatService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, VatService> : Effect.Effect<X, never, VatService>;
};
export declare class VatService extends VatService_base {
}
export declare const VatServiceLayer: Layer.Layer<VatService, never, AccountingDataPort>;
export {};
//# sourceMappingURL=service.d.ts.map