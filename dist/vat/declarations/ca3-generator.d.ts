import { Effect, Layer, Schema } from "effect";
import type { Period, UserId } from "../../models.js";
import { JournalDataPort } from "../../ports/journal-data.port.js";
import { VatSectorPort } from "../../ports/vat-sector.port.js";
import type { Ca3Declaration, GenerateCa3Input } from "../models.js";
import { type ADeclaration } from "../annexe-a-models.js";
import type { TerDeclaration } from "../ter-models.js";
import type { TicDeclaration } from "../tic-models.js";
declare const Ca3GenerationError_base: Schema.TaggedErrorClass<Ca3GenerationError, "Ca3GenerationError", {
    readonly _tag: Schema.tag<"Ca3GenerationError">;
} & {
    message: typeof Schema.String;
}>;
export declare class Ca3GenerationError extends Ca3GenerationError_base {
}
export type GenerateTerInput = {
    readonly userId: UserId;
    readonly period: Period;
};
export type GenerateAnnexeAInput = {
    readonly userId: UserId;
    readonly period: Period;
};
export type GenerateTicInput = {
    readonly userId: UserId;
    readonly period: Period;
};
export type Ca3GeneratorServiceInterface = {
    readonly generate: (input: GenerateCa3Input) => Effect.Effect<Ca3Declaration, Ca3GenerationError>;
    readonly generateTer: (input: GenerateTerInput) => Effect.Effect<TerDeclaration | null, Ca3GenerationError, VatSectorPort>;
    readonly generateAnnexeA: (input: GenerateAnnexeAInput) => Effect.Effect<ADeclaration | null, Ca3GenerationError>;
    readonly generateTic: (input: GenerateTicInput) => Effect.Effect<TicDeclaration | null, Ca3GenerationError>;
};
declare const Ca3GeneratorService_base: import("effect/Context").TagClass<Ca3GeneratorService, "@accounting/Ca3GeneratorService", Ca3GeneratorServiceInterface> & Effect.Tag.Proxy<Ca3GeneratorService, Ca3GeneratorServiceInterface> & {
    use: <X>(body: (_: Ca3GeneratorServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Ca3GeneratorService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Ca3GeneratorService> : Effect.Effect<X, never, Ca3GeneratorService>;
};
export declare class Ca3GeneratorService extends Ca3GeneratorService_base {
}
export declare const Ca3GeneratorServiceLayer: Layer.Layer<Ca3GeneratorService, never, JournalDataPort>;
export {};
//# sourceMappingURL=ca3-generator.d.ts.map