import { Effect, Schema } from "effect";
import type { AccountBalance, JournalEntryModel, JournalLineModel, Period, UserId } from "../models";
declare const AccountingDataError_base: Schema.TaggedErrorClass<AccountingDataError, "AccountingDataError", {
    readonly _tag: Schema.tag<"AccountingDataError">;
} & {
    operation: typeof Schema.String;
    details: typeof Schema.Unknown;
}>;
export declare class AccountingDataError extends AccountingDataError_base {
}
export type AccountingDataPortInterface = {
    /** Get account balances aggregated by account code for a period, filtered by account class */
    readonly getAccountBalancesByClass: (userId: UserId, period: Period, accountClass: number) => Effect.Effect<AccountBalance[], AccountingDataError>;
    /** Get account balances for specific account codes (or all if omitted) */
    readonly getAccountBalances: (userId: UserId, period: Period, accountCodes?: string[]) => Effect.Effect<AccountBalance[], AccountingDataError>;
    /** Find journal entries within a period */
    readonly findJournalEntriesByPeriod: (userId: UserId, period: Period) => Effect.Effect<JournalEntryModel[], AccountingDataError>;
    /** Find journal lines for given entry IDs */
    readonly findJournalLinesByEntryIds: (userId: UserId, entryIds: number[]) => Effect.Effect<JournalLineModel[], AccountingDataError>;
};
declare const AccountingDataPort_base: import("effect/Context").TagClass<AccountingDataPort, "@accounting/AccountingDataPort", AccountingDataPortInterface> & Effect.Tag.Proxy<AccountingDataPort, AccountingDataPortInterface> & {
    use: <X>(body: (_: AccountingDataPortInterface) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, AccountingDataPort | R> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, AccountingDataPort> : Effect.Effect<X, never, AccountingDataPort>;
};
export declare class AccountingDataPort extends AccountingDataPort_base {
}
export {};
//# sourceMappingURL=accounting-data.port.d.ts.map