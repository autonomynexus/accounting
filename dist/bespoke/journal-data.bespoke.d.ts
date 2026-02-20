import type { JournalEntryModel, JournalLineModel } from "../models.js";
import type { JournalDataPortInterface } from "../ports/journal-data.port.js";
/**
 * In-memory implementation of JournalDataPort for testing and standalone use.
 */
export declare const BespokeJournalData: {
    make: (data: {
        entries: readonly JournalEntryModel[];
        lines: readonly JournalLineModel[];
    }) => JournalDataPortInterface;
};
//# sourceMappingURL=journal-data.bespoke.d.ts.map