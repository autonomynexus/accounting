/**
 * VAT A Models (3310-A)
 *
 * Domain types for "Taxes Assimilées" annexe
 * Contains all taxes collected alongside VAT
 *
 * @see docs/plans/vat-annexes-data-model.md
 */
import { EUR, monetary } from "monetary";
// ============================================================================
// Tax Types
// ============================================================================
/**
 * Human-readable labels for tax types
 */
export const TAXE_ASSIMILEE_LABELS = {
    TRANSPORT_INFRASTRUCTURE: "Taxe sur les infrastructures de transport",
    METAUX_PRECIEUX: "Taxe sur les métaux précieux",
    VIDEOGRAMMES: "Taxe sur les vidéogrammes",
    JEUX_PARIS: "Taxe sur les jeux et paris",
    RENTE_ELECTRICITE: "Contribution au service public de l'électricité",
    VEHICULES_LOURDS: "Taxe sur les véhicules lourds",
    PASSAGERS_CORSE: "Taxe sur les passagers maritimes Corse",
    EMISSIONS_CO2: "Taxe sur les émissions de CO2",
    EOLIENNES_MARITIMES: "Taxe sur les éoliennes maritimes",
    EXPLORATION_HYDROCARBURES: "Taxe sur l'exploration d'hydrocarbures",
    TSN_NUMERIQUE: "Taxe sur les services numériques (TSN)",
    PUBLICITE: "Taxe sur la publicité",
    DROITS_SPORTIFS: "Taxe sur les droits sportifs",
    PROVISIONS_ASSURANCE: "Taxe sur les provisions d'assurance",
    REDEVANCE_SANITAIRE_PHYTOSANITAIRE: "Redevance sanitaire phytosanitaire",
    EAUX_MINERALES_NATURELLES: "Taxe sur les eaux minérales naturelles",
    PRODUITS_PHYTOPHARMACEUTIQUES: "Taxe sur les produits phytopharmaceutiques",
};
// ============================================================================
// Snapshot Conversion
// ============================================================================
/**
 * Convert ADeclaration to storable snapshot
 */
export function toASnapshot(a) {
    const allTaxes = [];
    for (const tax of a.taxes) {
        allTaxes.push({
            taxType: tax.taxType,
            enabled: tax.enabled,
            baseImposable: tax.baseImposable.amount,
            taxeDue: tax.taxeDue.amount,
            details: {},
        });
    }
    if (a.transportInfrastructure) {
        allTaxes.push({
            taxType: a.transportInfrastructure.taxType,
            enabled: a.transportInfrastructure.enabled,
            baseImposable: a.transportInfrastructure.baseImposable.amount,
            taxeDue: a.transportInfrastructure.taxeDue.amount,
            details: {
                tonnage: a.transportInfrastructure.details.tonnage,
                ratePerTon: a.transportInfrastructure.details.ratePerTon.amount,
            },
        });
    }
    if (a.videogram) {
        allTaxes.push({
            taxType: a.videogram.taxType,
            enabled: a.videogram.enabled,
            baseImposable: a.videogram.baseImposable.amount,
            taxeDue: a.videogram.taxeDue.amount,
            details: {
                advancesPaid: a.videogram.details.advancesPaid.amount,
                unitsSold: a.videogram.details.unitsSold,
                ratePerUnit: a.videogram.details.ratePerUnit.amount,
            },
        });
    }
    if (a.electricityProduction) {
        allTaxes.push({
            taxType: a.electricityProduction.taxType,
            enabled: a.electricityProduction.enabled,
            baseImposable: a.electricityProduction.baseImposable.amount,
            taxeDue: a.electricityProduction.taxeDue.amount,
            details: {
                productionMwh: a.electricityProduction.details.productionMwh,
                referencePriceEur: a.electricityProduction.details.referencePriceEur.amount,
                actualPriceEur: a.electricityProduction.details.actualPriceEur.amount,
                marginRate: a.electricityProduction.details.marginRate,
            },
        });
    }
    return {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        ligne29Total: a.ligne29Total.amount,
        taxes: allTaxes,
    };
}
/**
 * Helper to create zero monetary value
 */
const zeroEur = () => monetary({ amount: 0, currency: EUR });
/**
 * Convert snapshot back to ADeclaration
 */
export function fromASnapshot(snapshot) {
    const simpleTaxes = [];
    let transportInfrastructure = null;
    let videogram = null;
    let electricityProduction = null;
    for (const tax of snapshot.taxes) {
        const baseTax = {
            taxType: tax.taxType,
            enabled: tax.enabled,
            baseImposable: monetary({ amount: tax.baseImposable, currency: EUR }),
            taxeDue: monetary({ amount: tax.taxeDue, currency: EUR }),
        };
        switch (tax.taxType) {
            case "TRANSPORT_INFRASTRUCTURE": {
                const details = tax.details;
                transportInfrastructure = {
                    ...baseTax,
                    taxType: "TRANSPORT_INFRASTRUCTURE",
                    details: {
                        tonnage: details.tonnage ?? 0,
                        ratePerTon: monetary({
                            amount: details.ratePerTon ?? 0,
                            currency: EUR,
                        }),
                    },
                };
                break;
            }
            case "VIDEOGRAMMES": {
                const details = tax.details;
                videogram = {
                    ...baseTax,
                    taxType: "VIDEOGRAMMES",
                    details: {
                        advancesPaid: monetary({
                            amount: details.advancesPaid ?? 0,
                            currency: EUR,
                        }),
                        unitsSold: details.unitsSold ?? 0,
                        ratePerUnit: monetary({
                            amount: details.ratePerUnit ?? 0,
                            currency: EUR,
                        }),
                    },
                };
                break;
            }
            case "RENTE_ELECTRICITE": {
                const details = tax.details;
                electricityProduction = {
                    ...baseTax,
                    taxType: "RENTE_ELECTRICITE",
                    details: {
                        productionMwh: details.productionMwh ?? 0,
                        referencePriceEur: monetary({
                            amount: details.referencePriceEur ?? 0,
                            currency: EUR,
                        }),
                        actualPriceEur: monetary({
                            amount: details.actualPriceEur ?? 0,
                            currency: EUR,
                        }),
                        marginRate: details.marginRate ?? 0,
                    },
                };
                break;
            }
            default:
                simpleTaxes.push(baseTax);
        }
    }
    return {
        taxes: simpleTaxes,
        transportInfrastructure,
        videogram,
        electricityProduction,
        ligne29Total: monetary({ amount: snapshot.ligne29Total, currency: EUR }),
    };
}
/**
 * Create empty A declaration
 */
export function createEmptyADeclaration() {
    return {
        taxes: [],
        transportInfrastructure: null,
        videogram: null,
        electricityProduction: null,
        ligne29Total: zeroEur(),
    };
}
/**
 * Calculate ligne 29 total from all taxes
 */
export function calculateLigne29Total(a) {
    let total = 0;
    for (const tax of a.taxes) {
        if (tax.enabled) {
            total += tax.taxeDue.amount;
        }
    }
    if (a.transportInfrastructure?.enabled) {
        total += a.transportInfrastructure.taxeDue.amount;
    }
    if (a.videogram?.enabled) {
        total += a.videogram.taxeDue.amount;
    }
    if (a.electricityProduction?.enabled) {
        total += a.electricityProduction.taxeDue.amount;
    }
    return monetary({ amount: total, currency: EUR });
}
//# sourceMappingURL=annexe-a-models.js.map