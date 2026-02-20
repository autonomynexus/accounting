import { Layer } from "effect";
import type { ScaledAmount } from "monetary";
import { UrssafRatesPort } from "../ports";
/**
 * Keys should be formatted as `${ActivityType}:${RateType}`, e.g. "BNC:base"
 */
export declare function makeBespokeUrssafRatesLayer(rates: Map<string, ScaledAmount<number>>): Layer.Layer<UrssafRatesPort, never, never>;
//# sourceMappingURL=urssaf-rates.bespoke.d.ts.map