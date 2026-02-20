import { Context, Effect } from "effect";
import type { UserId } from "../models.js";
import type { VatSectorConfig } from "../vat/ter-models.js";
/**
 * Port for accessing VAT sector data.
 * Only needed if you use the TER annexe generator (multi-sector businesses).
 */
export type VatSectorPortInterface = {
    readonly getActiveSectors: (userId: UserId) => Effect.Effect<readonly VatSectorConfig[]>;
};
declare const VatSectorPort_base: Context.TagClass<VatSectorPort, "@accounting/VatSectorPort", VatSectorPortInterface>;
export declare class VatSectorPort extends VatSectorPort_base {
}
export {};
//# sourceMappingURL=vat-sector.port.d.ts.map