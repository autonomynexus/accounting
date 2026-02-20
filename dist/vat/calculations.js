import { add, allocate, EUR, monetary, multiply, subtract } from "monetary";
export function calculateHTfromTTC(ttc, vatRate) {
    if (vatRate.amount === 0)
        return ttc;
    const htRatio = 10 ** vatRate.scale;
    const vatRatio = vatRate.amount;
    const [ht] = allocate(ttc, [htRatio, vatRatio]);
    if (!ht)
        throw new Error("Failed to allocate monetary value");
    return ht;
}
export function calculateTTCfromHT(ht, vatRate) {
    const multiplier = {
        amount: 10 ** vatRate.scale + vatRate.amount,
        scale: vatRate.scale,
    };
    return multiply(ht, multiplier);
}
export function calculateVATfromTTC(ttc, vatRate) {
    if (vatRate.amount === 0)
        return multiply(ttc, 0);
    const ht = calculateHTfromTTC(ttc, vatRate);
    return subtract(ttc, ht);
}
export function calculateVATfromHT(ht, vatRate) {
    return multiply(ht, vatRate);
}
export const FRENCH_VAT_RATES = {
    STANDARD: 20,
    INTERMEDIATE: 10,
    REDUCED: 5.5,
    SUPER_REDUCED: 2.1,
    EXEMPT: 0,
};
export function isValidFrenchVATRate(rate) {
    return Object.values(FRENCH_VAT_RATES).includes(rate);
}
export function calculateItemsTotals(items) {
    return items.reduce((acc, item) => {
        const itemHT = item.amount;
        const itemVAT = item.taxRate ? calculateVATfromHT(itemHT, item.taxRate) : multiply(itemHT, 0);
        const itemTTC = add(itemHT, itemVAT);
        return {
            totalHT: add(acc.totalHT, itemHT),
            totalTTC: add(acc.totalTTC, itemTTC),
            totalVAT: add(acc.totalVAT, itemVAT),
        };
    }, {
        totalHT: multiply(items[0]?.amount ?? monetary({ amount: 0, currency: EUR }), 0),
        totalTTC: multiply(items[0]?.amount ?? monetary({ amount: 0, currency: EUR }), 0),
        totalVAT: multiply(items[0]?.amount ?? monetary({ amount: 0, currency: EUR }), 0),
    });
}
//# sourceMappingURL=calculations.js.map