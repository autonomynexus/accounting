import { Effect, Layer } from "effect";
import { AccountingDataPort } from "../ports";
export function makeBespokeAccountingDataLayer(data) {
    return Layer.succeed(AccountingDataPort, AccountingDataPort.of({
        getAccountBalancesByClass: (_userId, _period, accountClass) => Effect.succeed(data.balances.filter((b) => b.accountCode.startsWith(String(accountClass)))),
        getAccountBalances: (_userId, _period, accountCodes) => Effect.succeed(accountCodes
            ? data.balances.filter((b) => accountCodes.includes(b.accountCode))
            : data.balances),
        findJournalEntriesByPeriod: (userId, period) => Effect.succeed(data.entries.filter((e) => e.userId === userId && e.date >= period.startDate && e.date <= period.endDate)),
        findJournalLinesByEntryIds: (_userId, entryIds) => Effect.succeed(data.lines.filter((l) => entryIds.includes(l.journalEntryId))),
    }));
}
//# sourceMappingURL=accounting-data.bespoke.js.map