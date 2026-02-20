/**
 * IS (Impôt sur les Sociétés) Computation
 * 2572-SD (Relevé de solde), 2065 (Déclaration de résultats)
 */
import type { MonetaryAmount } from "../models.js";
/** IS rate thresholds */
export declare const IS_TAUX_REDUIT_PLAFOND = 42500;
export declare const IS_CA_PLAFOND_TAUX_REDUIT = 10000000;
export declare const IS_TAUX_REDUIT = 0.15;
export declare const IS_TAUX_NORMAL = 0.25;
export declare const IS_CONTRIBUTION_SOCIALE_SEUIL = 763000;
export declare const IS_CONTRIBUTION_SOCIALE_TAUX = 0.033;
export declare const IS_CONTRIBUTION_SOCIALE_ABATTEMENT = 763000;
/** Dates limites des acomptes (jour/mois) */
export declare const ACOMPTES_DATES: readonly [{
    readonly mois: 3;
    readonly jour: 15;
}, {
    readonly mois: 6;
    readonly jour: 15;
}, {
    readonly mois: 9;
    readonly jour: 15;
}, {
    readonly mois: 12;
    readonly jour: 15;
}];
export type AcompteIS = {
    readonly numero: 1 | 2 | 3 | 4;
    readonly dateEcheance: Date;
    readonly montant: MonetaryAmount;
    readonly paye: boolean;
    readonly datePaiement: Date | null;
};
export type Form2572 = {
    readonly _tag: "Form2572";
    readonly exercice: {
        readonly dateDebut: Date;
        readonly dateFin: Date;
    };
    readonly siren: string;
    readonly denomination: string;
    /** Résultat fiscal */
    readonly resultatFiscal: MonetaryAmount;
    /** Chiffre d'affaires HT */
    readonly chiffreAffairesHT: MonetaryAmount;
    /** Éligible au taux réduit */
    readonly eligibleTauxReduit: boolean;
    /** IS au taux réduit (15% sur première tranche) */
    readonly isAuTauxReduit: MonetaryAmount;
    /** IS au taux normal (25% sur le reste) */
    readonly isAuTauxNormal: MonetaryAmount;
    /** IS brut total */
    readonly isBrut: MonetaryAmount;
    /** Contribution sociale sur les bénéfices (3.3%) */
    readonly contributionSociale: MonetaryAmount;
    /** IS + contribution sociale */
    readonly totalDu: MonetaryAmount;
    /** Acomptes versés */
    readonly acomptesVerses: MonetaryAmount;
    /** Crédits d'impôt */
    readonly creditsImpot: MonetaryAmount;
    /** Solde à payer (ou crédit à reporter) */
    readonly solde: MonetaryAmount;
    /** Excédent de versement (si solde négatif) */
    readonly excedentVersement: MonetaryAmount;
};
export type DeficitReportable = {
    readonly exerciceOrigine: string;
    readonly montant: MonetaryAmount;
    readonly montantUtilise: MonetaryAmount;
    readonly montantRestant: MonetaryAmount;
};
export type SuiviDeficits = {
    readonly deficits: readonly DeficitReportable[];
    readonly totalRestant: MonetaryAmount;
};
//# sourceMappingURL=models.d.ts.map