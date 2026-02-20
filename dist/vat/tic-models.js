/**
 * VAT TIC Models (3310-TIC)
 *
 * Domain types for "Accises Produits Énergétiques" annexe
 * Energy excise taxes (electricity, gas, coal, other)
 *
 * @see docs/plans/vat-annexes-data-model.md
 */
import { EUR, monetary } from "monetary";
// ============================================================================
// Types
// ============================================================================
/**
 * Human-readable labels for TIC exemption codes
 * E08-E22 per French tax code (CGI)
 */
export const TIC_EXEMPTION_LABELS = {
    E08: "Électricité produite à bord des navires",
    E09: "Production d'électricité",
    E10: "Transport de personnes et marchandises",
    E11: "Production de produits énergétiques",
    E12: "Maintien de la capacité de production d'électricité",
    E13: "Électricité utilisée pour son propre fonctionnement",
    E14: "Électricité produite par petits producteurs",
    E15: "Électricité consommée pour des procédés métallurgiques",
    E16: "Électricité consommée pour des procédés d'électrolyse",
    E17: "Électricité utilisée pour le recyclage",
    E18: "Extraction de gaz naturel",
    E19: "Double usage du gaz naturel",
    E20: "Gaz naturel pour usage carburant",
    E21: "Usage comme matière première",
    E22: "Fabrication de produits minéraux non métalliques",
};
/**
 * Human-readable labels for accise types
 */
export const ACCISE_TYPE_LABELS = {
    TICFE: "Taxe intérieure sur la consommation finale d'électricité",
    TICGN: "Taxe intérieure sur la consommation de gaz naturel",
    TICC: "Taxe intérieure sur la consommation de charbon",
    TICPE: "Taxe intérieure sur la consommation de produits énergétiques",
};
/**
 * Create a new meter with default values
 */
export function createEmptyMeter(sectionType, reference) {
    const zeroEur = monetary({ amount: 0, currency: EUR });
    return {
        sectionType,
        reference,
        siret: null,
        codeApe: null,
        motifTarifReduit: null,
        closingDate: null,
        quantity: 0,
        quantityScale: 0,
        rate: zeroEur,
        deductiblePortion: zeroEur,
        carryover: zeroEur,
        netDue: zeroEur,
        details: {},
    };
}
// ============================================================================
// Snapshot Conversion
// ============================================================================
/**
 * Convert TicDeclaration to storable snapshot
 */
export function toTicSnapshot(tic) {
    const allMeters = [];
    const addMeters = (section) => {
        for (const meter of section.meters) {
            allMeters.push({
                id: meter.id,
                sectionType: meter.sectionType,
                reference: meter.reference,
                siret: meter.siret,
                codeApe: meter.codeApe,
                motifTarifReduit: meter.motifTarifReduit,
                closingDate: meter.closingDate?.toISOString() ?? null,
                quantity: meter.quantity,
                rate: meter.rate.amount,
                deductiblePortion: meter.deductiblePortion.amount,
                carryover: meter.carryover.amount,
                netDue: meter.netDue.amount,
                details: meter.details,
            });
        }
    };
    addMeters(tic.electricity);
    addMeters(tic.gas);
    addMeters(tic.coal);
    addMeters(tic.other);
    return {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        electricityEnabled: tic.electricityEnabled,
        gasEnabled: tic.gasEnabled,
        coalEnabled: tic.coalEnabled,
        otherEnabled: tic.otherEnabled,
        netBalanceDue: tic.netBalanceDue.amount,
        netCreditRefund: tic.netCreditRefund.amount,
        meters: allMeters,
    };
}
/**
 * Helper to create zero monetary value
 */
const zeroEur = () => monetary({ amount: 0, currency: EUR });
/**
 * Create empty section
 */
function createEmptySection(type, acciseType) {
    return {
        type,
        acciseType,
        enabled: false,
        meters: [],
        totalQuantity: 0,
        totalTaxDue: zeroEur(),
        totalDeductible: zeroEur(),
        totalCarryover: zeroEur(),
        netDue: zeroEur(),
    };
}
/**
 * Convert snapshot back to TicDeclaration
 */
export function fromTicSnapshot(snapshot) {
    const parseMeters = (sectionType) => {
        return snapshot.meters
            .filter((m) => m.sectionType === sectionType)
            .map((m) => ({
            id: m.id,
            sectionType: m.sectionType,
            reference: m.reference,
            siret: m.siret,
            codeApe: m.codeApe,
            motifTarifReduit: m.motifTarifReduit,
            closingDate: m.closingDate ? new Date(m.closingDate) : null,
            quantity: m.quantity,
            quantityScale: 0, // Default, not stored in snapshot
            rate: monetary({ amount: m.rate, currency: EUR }),
            deductiblePortion: monetary({
                amount: m.deductiblePortion,
                currency: EUR,
            }),
            carryover: monetary({ amount: m.carryover, currency: EUR }),
            netDue: monetary({ amount: m.netDue, currency: EUR }),
            details: m.details,
        }));
    };
    const calculateSectionTotals = (meters) => {
        let totalQuantity = 0;
        let totalTaxDue = 0;
        let totalDeductible = 0;
        let totalCarryover = 0;
        let netDue = 0;
        for (const meter of meters) {
            totalQuantity += meter.quantity;
            totalTaxDue += meter.rate.amount * meter.quantity;
            totalDeductible += meter.deductiblePortion.amount;
            totalCarryover += meter.carryover.amount;
            netDue += meter.netDue.amount;
        }
        return {
            totalQuantity,
            totalTaxDue: monetary({ amount: totalTaxDue, currency: EUR }),
            totalDeductible: monetary({ amount: totalDeductible, currency: EUR }),
            totalCarryover: monetary({ amount: totalCarryover, currency: EUR }),
            netDue: monetary({ amount: netDue, currency: EUR }),
        };
    };
    const electricityMeters = parseMeters("ELECTRICITY");
    const gasMeters = parseMeters("GAS");
    const coalMeters = parseMeters("COAL");
    const otherMeters = parseMeters("OTHER");
    return {
        electricityEnabled: snapshot.electricityEnabled,
        gasEnabled: snapshot.gasEnabled,
        coalEnabled: snapshot.coalEnabled,
        otherEnabled: snapshot.otherEnabled,
        electricity: {
            type: "ELECTRICITY",
            acciseType: "TICFE",
            enabled: snapshot.electricityEnabled,
            meters: electricityMeters,
            ...calculateSectionTotals(electricityMeters),
        },
        gas: {
            type: "GAS",
            acciseType: "TICGN",
            enabled: snapshot.gasEnabled,
            meters: gasMeters,
            ...calculateSectionTotals(gasMeters),
        },
        coal: {
            type: "COAL",
            acciseType: "TICC",
            enabled: snapshot.coalEnabled,
            meters: coalMeters,
            ...calculateSectionTotals(coalMeters),
        },
        other: {
            type: "OTHER",
            acciseType: "TICPE",
            enabled: snapshot.otherEnabled,
            meters: otherMeters,
            ...calculateSectionTotals(otherMeters),
        },
        netBalanceDue: monetary({ amount: snapshot.netBalanceDue, currency: EUR }),
        netCreditRefund: monetary({
            amount: snapshot.netCreditRefund,
            currency: EUR,
        }),
    };
}
/**
 * Create empty TIC declaration
 */
export function createEmptyTicDeclaration() {
    return {
        electricityEnabled: false,
        gasEnabled: false,
        coalEnabled: false,
        otherEnabled: false,
        electricity: createEmptySection("ELECTRICITY", "TICFE"),
        gas: createEmptySection("GAS", "TICGN"),
        coal: createEmptySection("COAL", "TICC"),
        other: createEmptySection("OTHER", "TICPE"),
        netBalanceDue: zeroEur(),
        netCreditRefund: zeroEur(),
    };
}
/**
 * Calculate net balance from all sections
 */
export function calculateTicNetBalance(tic) {
    let totalDue = 0;
    if (tic.electricityEnabled) {
        totalDue += tic.electricity.netDue.amount;
    }
    if (tic.gasEnabled) {
        totalDue += tic.gas.netDue.amount;
    }
    if (tic.coalEnabled) {
        totalDue += tic.coal.netDue.amount;
    }
    if (tic.otherEnabled) {
        totalDue += tic.other.netDue.amount;
    }
    return {
        netBalanceDue: totalDue >= 0 ? monetary({ amount: totalDue, currency: EUR }) : zeroEur(),
        netCreditRefund: totalDue < 0 ? monetary({ amount: Math.abs(totalDue), currency: EUR }) : zeroEur(),
    };
}
//# sourceMappingURL=tic-models.js.map