import { Effect } from "effect";
/**
 * In-memory implementation of JournalDataPort for testing and standalone use.
 */
export const BespokeJournalData = {
    make: (data) => ({
        findEntriesByPeriod: (userId, period) => Effect.succeed(data.entries.filter((e) => e.userId === userId && e.date >= period.startDate && e.date <= period.endDate)),
        findLinesByEntryIds: (_userId, entryIds) => Effect.succeed(data.lines.filter((l) => entryIds.includes(l.journalEntryId))),
    }),
};
//# sourceMappingURL=journal-data.bespoke.js.map