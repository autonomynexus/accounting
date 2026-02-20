import type { Monetary } from "monetary";
import type { Ca3TvaLine, Ca12TvaLine } from "./models.js";
/**
 * Format monetary amount for French tax forms (2 decimals, comma separator)
 * Returns empty string for zero amounts
 */
export declare function formatVatAmount(value: Monetary<number>): string;
/**
 * Type guard to check if value is a TVA line with base and tva fields
 */
export declare function isTvaLine(value: Monetary<number> | Ca3TvaLine | Ca12TvaLine): value is Ca3TvaLine | Ca12TvaLine;
//# sourceMappingURL=formatting.d.ts.map