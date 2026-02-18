import { Effect, Layer } from "effect";
import type {
  AccountBalance,
  JournalEntryModel,
  JournalLineModel,
  Period,
  UserId,
} from "../models";
import { AccountingDataPort } from "../ports";

export type BespokeAccountingData = {
  readonly balances: AccountBalance[];
  readonly entries: JournalEntryModel[];
  readonly lines: JournalLineModel[];
};

export function makeBespokeAccountingDataLayer(data: BespokeAccountingData) {
  return Layer.succeed(
    AccountingDataPort,
    AccountingDataPort.of({
      getAccountBalancesByClass: (_userId: UserId, _period: Period, accountClass: number) =>
        Effect.succeed(data.balances.filter((b) => b.accountCode.startsWith(String(accountClass)))),

      getAccountBalances: (_userId: UserId, _period: Period, accountCodes?: string[]) =>
        Effect.succeed(
          accountCodes
            ? data.balances.filter((b) => accountCodes.includes(b.accountCode))
            : data.balances,
        ),

      findJournalEntriesByPeriod: (userId: UserId, period: Period) =>
        Effect.succeed(
          data.entries.filter(
            (e) => e.userId === userId && e.date >= period.startDate && e.date <= period.endDate,
          ),
        ),

      findJournalLinesByEntryIds: (_userId: UserId, entryIds: number[]) =>
        Effect.succeed(data.lines.filter((l) => entryIds.includes(l.journalEntryId))),
    }),
  );
}
