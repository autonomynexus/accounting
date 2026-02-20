import { Effect, Layer } from "effect";
import type { Period, UserId } from "../models.js";
import { AccountingDataPort, type AccountingDataError } from "../ports/accounting-data.port.js";
import type { IncomeStatement } from "./income-statement-models.js";
export type IncomeStatementServiceInterface = {
    readonly generateIncomeStatement: (params: {
        userId: UserId;
        fiscalYear: Period;
        previousYearIncomeStatement?: IncomeStatement;
    }) => Effect.Effect<IncomeStatement, AccountingDataError, AccountingDataPort>;
};
declare const IncomeStatementService_base: import("effect/Context").TagClass<IncomeStatementService, "@accounting/IncomeStatementService", IncomeStatementServiceInterface> & Effect.Tag.Proxy<IncomeStatementService, IncomeStatementServiceInterface> & {
    use: <X>(body: (_: IncomeStatementServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | IncomeStatementService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, IncomeStatementService> : Effect.Effect<X, never, IncomeStatementService>;
};
export declare class IncomeStatementService extends IncomeStatementService_base {
}
export declare const IncomeStatementServiceLayer: Layer.Layer<IncomeStatementService, never, AccountingDataPort>;
export {};
//# sourceMappingURL=income-statement-service.d.ts.map