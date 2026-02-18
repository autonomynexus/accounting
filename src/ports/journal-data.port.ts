import { Context, Effect } from "effect";
import type { JournalEntryModel, JournalLineModel, Period, UserId } from "../models.js";

/**
 * Port for accessing journal entry and line data.
 * Used by CA3/CA12 generators and other filing services.
 *
 * Implement this with your database layer (Drizzle, Prisma, etc.)
 * or use the bespoke in-memory implementation for testing.
 */
export type JournalDataPortInterface = {
  /**
   * Find all journal entries for a user within a period.
   */
  readonly findEntriesByPeriod: (
    userId: UserId,
    period: Period,
  ) => Effect.Effect<readonly JournalEntryModel[]>;

  /**
   * Find all journal lines for given entry IDs.
   */
  readonly findLinesByEntryIds: (
    userId: UserId,
    entryIds: readonly number[],
  ) => Effect.Effect<readonly JournalLineModel[]>;
};

export class JournalDataPort extends Context.Tag("@accounting/JournalDataPort")<
  JournalDataPort,
  JournalDataPortInterface
>() {}
