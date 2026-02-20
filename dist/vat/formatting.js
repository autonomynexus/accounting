/**
 * Get the numeric value from a Monetary amount
 * (amount / 10^scale)
 */
function getMoneyValue(value) {
    return value.amount / 10 ** value.scale;
}
/**
 * Format monetary amount for French tax forms (2 decimals, comma separator)
 * Returns empty string for zero amounts
 */
export function formatVatAmount(value) {
    const amount = getMoneyValue(value);
    if (amount === 0) {
        return "";
    }
    return amount.toFixed(2).replace(".", ",");
}
/**
 * Type guard to check if value is a TVA line with base and tva fields
 */
export function isTvaLine(value) {
    return typeof value === "object" && "base" in value && "tva" in value;
}
//# sourceMappingURL=formatting.js.map