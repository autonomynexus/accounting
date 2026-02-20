/**
 * Amortization Engine — Models
 * Linear and declining balance amortization per PCG
 */
import type { MonetaryAmount } from "../models.js";
export type AmortizationMethod = "LINEAIRE" | "DEGRESSIF";
/**
 * PCG declining balance coefficients (amortissement dégressif)
 * Based on useful life duration.
 */
export declare const DEGRESSIF_COEFFICIENTS: readonly {
    readonly minYears: number;
    readonly maxYears: number;
    readonly coefficient: number;
}[];
export declare function getDegressifCoefficient(dureeAnnees: number): number;
export type ImmobilisationStatus = "EN_SERVICE" | "CEDEE" | "MISE_AU_REBUT" | "TOTALEMENT_AMORTIE";
export type Immobilisation = {
    readonly id: string;
    readonly compteNum: string;
    readonly compteAmortNum: string;
    readonly libelle: string;
    readonly dateAcquisition: Date;
    readonly dateMiseEnService: Date;
    readonly dateCession: Date | null;
    readonly valeurAcquisition: MonetaryAmount;
    readonly valeurResiduelle: MonetaryAmount;
    readonly dureeAmortissement: number;
    readonly methode: AmortizationMethod;
    readonly status: ImmobilisationStatus;
    readonly exerciceId: string;
};
export type AmortizationLine = {
    readonly exercice: string;
    readonly dateDebut: Date;
    readonly dateFin: Date;
    readonly baseAmortissable: MonetaryAmount;
    readonly taux: number;
    readonly prorata: number;
    readonly dotation: MonetaryAmount;
    readonly amortissementsCumules: MonetaryAmount;
    readonly valeurNetteComptable: MonetaryAmount;
};
export type AmortizationSchedule = {
    readonly immobilisationId: string;
    readonly methode: AmortizationMethod;
    readonly lignes: readonly AmortizationLine[];
    readonly totalDotations: MonetaryAmount;
};
export type CessionImmobilisation = {
    readonly immobilisationId: string;
    readonly dateCession: Date;
    readonly prixCession: MonetaryAmount;
    readonly valeurNetteComptable: MonetaryAmount;
    readonly plusOuMoinsValue: MonetaryAmount;
    readonly dotationComplementaire: MonetaryAmount;
};
//# sourceMappingURL=models.d.ts.map