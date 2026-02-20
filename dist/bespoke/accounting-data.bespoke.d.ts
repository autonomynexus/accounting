import { Layer } from "effect";
import type { AccountBalance, JournalEntryModel, JournalLineModel } from "../models";
import { AccountingDataPort } from "../ports";
export type BespokeAccountingData = {
    readonly balances: AccountBalance[];
    readonly entries: JournalEntryModel[];
    readonly lines: JournalLineModel[];
};
export declare function makeBespokeAccountingDataLayer(data: BespokeAccountingData): Layer.Layer<AccountingDataPort, never, never>;
//# sourceMappingURL=accounting-data.bespoke.d.ts.map