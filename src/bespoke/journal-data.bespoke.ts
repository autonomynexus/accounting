import { Effect } from "effect";
import type { JournalEntryModel, JournalLineModel, Period, UserId } from "../models.js";
import type { JournalDataPortInterface } from "../ports/journal-data.port.js";

/**
 * In-memory implementation of JournalDataPort for testing and standalone use.
 */
export const BespokeJournalData = {
  make: (data: {
    entries: readonly JournalEntryModel[];
    lines: readonly JournalLineModel[];
  }): JournalDataPortInterface => ({
    findEntriesByPeriod: (userId: UserId, period: Period) =>
      Effect.succeed(
        data.entries.filter(
          (e) => e.userId === userId && e.date >= period.startDate && e.date <= period.endDate,
        ),
      ),

    findLinesByEntryIds: (_userId: UserId, entryIds: readonly number[]) =>
      Effect.succeed(data.lines.filter((l) => entryIds.includes(l.journalEntryId))),
  }),
};
