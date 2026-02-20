import { Effect, Layer, Schema } from "effect";
import { JournalDataPort } from "../../ports/journal-data.port.js";
import type { Ca12Declaration, GenerateCa12Input } from "../models.js";
declare const Ca12GenerationError_base: Schema.TaggedErrorClass<Ca12GenerationError, "Ca12GenerationError", {
    readonly _tag: Schema.tag<"Ca12GenerationError">;
} & {
    message: typeof Schema.String;
}>;
export declare class Ca12GenerationError extends Ca12GenerationError_base {
}
export type Ca12GeneratorServiceInterface = {
    readonly generate: (input: GenerateCa12Input) => Effect.Effect<Ca12Declaration, Ca12GenerationError>;
};
declare const Ca12GeneratorService_base: import("effect/Context").TagClass<Ca12GeneratorService, "@accounting/Ca12GeneratorService", Ca12GeneratorServiceInterface> & Effect.Tag.Proxy<Ca12GeneratorService, Ca12GeneratorServiceInterface> & {
    use: <X>(body: (_: Ca12GeneratorServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Ca12GeneratorService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Ca12GeneratorService> : Effect.Effect<X, never, Ca12GeneratorService>;
};
export declare class Ca12GeneratorService extends Ca12GeneratorService_base {
}
export declare const Ca12GeneratorServiceLayer: Layer.Layer<Ca12GeneratorService, never, JournalDataPort>;
export {};
//# sourceMappingURL=ca12-generator.d.ts.map