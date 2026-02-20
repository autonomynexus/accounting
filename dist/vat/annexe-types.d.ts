/**
 * Types originally from myautonomy DB schema (vat-annexes)
 * Redefined here to avoid DB coupling
 */
export declare const TAXE_ASSIMILEE_TYPES: readonly ["TRANSPORT_INFRASTRUCTURE", "METAUX_PRECIEUX", "VIDEOGRAMMES", "JEUX_PARIS", "RENTE_ELECTRICITE", "VEHICULES_LOURDS", "PASSAGERS_CORSE", "EMISSIONS_CO2", "EOLIENNES_MARITIMES", "EXPLORATION_HYDROCARBURES", "TSN_NUMERIQUE", "PUBLICITE", "DROITS_SPORTIFS", "PROVISIONS_ASSURANCE", "REDEVANCE_SANITAIRE_PHYTOSANITAIRE", "EAUX_MINERALES_NATURELLES", "PRODUITS_PHYTOPHARMACEUTIQUES"];
export type TaxeAssimileeType = (typeof TAXE_ASSIMILEE_TYPES)[number];
export declare const ACCISE_TYPES: readonly ["TICFE", "TICGN", "TICC", "TICPE"];
export type AcciseType = (typeof ACCISE_TYPES)[number];
export declare const TIC_SECTION_TYPES: readonly ["ELECTRICITY", "GAS", "COAL", "OTHER"];
export type TicSectionType = (typeof TIC_SECTION_TYPES)[number];
export declare const TIC_EXEMPTION_CODES: readonly ["E08", "E09", "E10", "E11", "E12", "E13", "E14", "E15", "E16", "E17", "E18", "E19", "E20", "E21", "E22"];
export type TicExemptionCode = (typeof TIC_EXEMPTION_CODES)[number];
export type ADeclarationSnapshot = {
    readonly version: string;
    readonly generatedAt: string;
    readonly ligne29Total: number;
    readonly taxes: readonly {
        readonly taxType: string;
        readonly enabled: boolean;
        readonly baseImposable: number;
        readonly taxeDue: number;
        readonly details: Record<string, unknown>;
    }[];
};
export type TerDeclarationSnapshot = {
    readonly version: string;
    readonly generatedAt: string;
    readonly generalDeductionPercentage: number;
    readonly mentionExpresse: boolean;
    readonly comments: readonly string[];
    readonly sectors: readonly {
        readonly sectorId: number;
        readonly sectorNumber: number;
        readonly tvaBrute: number;
        readonly tvaAReverser: number;
        readonly totalBrute: number;
        readonly immoExclusive: number;
        readonly immoNonExclusive: number;
        readonly immoTotal: number;
        readonly absExclusive: number;
        readonly absNonExclusive: number;
        readonly absTotal: number;
        readonly complementTva: number;
        readonly totalDeductible: number;
        readonly tvaNette: number;
        readonly creditTva: number;
    }[];
    readonly totals: {
        readonly tvaBrute: number;
        readonly totalDeductible: number;
        readonly tvaNette: number;
        readonly creditTva: number;
    };
};
export type TicDeclarationSnapshot = {
    readonly version: string;
    readonly generatedAt: string;
    readonly electricityEnabled: boolean;
    readonly gasEnabled: boolean;
    readonly coalEnabled: boolean;
    readonly otherEnabled: boolean;
    readonly netBalanceDue: number;
    readonly netCreditRefund: number;
    readonly meters: readonly {
        readonly id: number;
        readonly sectionType: string;
        readonly reference: string;
        readonly siret: string | null;
        readonly codeApe: string | null;
        readonly motifTarifReduit: string | null;
        readonly closingDate: string | null;
        readonly quantity: number;
        readonly rate: number;
        readonly deductiblePortion: number;
        readonly carryover: number;
        readonly netDue: number;
        readonly details: Record<string, unknown>;
    }[];
};
//# sourceMappingURL=annexe-types.d.ts.map