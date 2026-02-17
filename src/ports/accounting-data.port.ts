import { Effect, Schema } from "effect";
import type {
  AccountBalance,
  JournalEntryModel,
  JournalLineModel,
  Period,
  UserId,
} from "../models";

// ============================================================================
// Tagged Errors
// ============================================================================

export class AccountingDataError extends Schema.TaggedError<AccountingDataError>()(
  "AccountingDataError",
  {
    operation: Schema.String,
    details: Schema.Unknown,
  },
) {}

// ============================================================================
// Port Interface
// ============================================================================

export type AccountingDataPortInterface = {
  /** Get account balances aggregated by account code for a period, filtered by account class */
  readonly getAccountBalancesByClass: (
    userId: UserId,
    period: Period,
    accountClass: number,
  ) => Effect.Effect<AccountBalance[], AccountingDataError>;

  /** Get account balances for specific account codes (or all if omitted) */
  readonly getAccountBalances: (
    userId: UserId,
    period: Period,
    accountCodes?: string[],
  ) => Effect.Effect<AccountBalance[], AccountingDataError>;

  /** Find journal entries within a period */
  readonly findJournalEntriesByPeriod: (
    userId: UserId,
    period: Period,
  ) => Effect.Effect<JournalEntryModel[], AccountingDataError>;

  /** Find journal lines for given entry IDs */
  readonly findJournalLinesByEntryIds: (
    userId: UserId,
    entryIds: number[],
  ) => Effect.Effect<JournalLineModel[], AccountingDataError>;
};

// ============================================================================
// Port Tag
// ============================================================================

export class AccountingDataPort extends Effect.Tag(
  "@accounting/AccountingDataPort",
)<AccountingDataPort, AccountingDataPortInterface>() {}
