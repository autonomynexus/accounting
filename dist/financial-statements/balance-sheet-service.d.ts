import { Effect, Layer } from "effect";
import type { UserId } from "../models.js";
import { AccountingDataPort, type AccountingDataError } from "../ports/accounting-data.port.js";
import type { BalanceSheet } from "./balance-sheet-models.js";
export type BalanceSheetServiceInterface = {
    readonly generateBalanceSheet: (params: {
        userId: UserId;
        fiscalYearStart: Date;
        fiscalYearEnd: Date;
        previousYearBalanceSheet?: BalanceSheet;
    }) => Effect.Effect<BalanceSheet, AccountingDataError, AccountingDataPort>;
    readonly validateBalanceSheet: (balanceSheet: BalanceSheet) => Effect.Effect<string[], never>;
};
declare const BalanceSheetService_base: import("effect/Context").TagClass<BalanceSheetService, "@accounting/BalanceSheetService", BalanceSheetServiceInterface> & Effect.Tag.Proxy<BalanceSheetService, BalanceSheetServiceInterface> & {
    use: <X>(body: (_: BalanceSheetServiceInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | BalanceSheetService> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, BalanceSheetService> : Effect.Effect<X, never, BalanceSheetService>;
};
export declare class BalanceSheetService extends BalanceSheetService_base {
}
export declare const BalanceSheetServiceLayer: Layer.Layer<BalanceSheetService, never, AccountingDataPort>;
export {};
//# sourceMappingURL=balance-sheet-service.d.ts.map