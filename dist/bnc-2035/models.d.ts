/**
 * 2035 BNC — Déclaration contrôlée (EI / Profession libérale)
 * Cash-basis accounting (recettes/dépenses)
 */
import type { MonetaryAmount } from "../models.js";
export type Form2035 = {
    readonly _tag: "Form2035";
    readonly exercice: {
        readonly dateDebut: Date;
        readonly dateFin: Date;
    };
    readonly siren: string;
    readonly denomination: string;
    readonly activite: string;
    readonly form2035A: Form2035A;
    readonly form2035B: Form2035B;
    readonly resultatFiscal: MonetaryAmount;
};
export type Form2035A = {
    readonly _tag: "Form2035A";
    readonly recettesEncaissees: MonetaryAmount;
    readonly deboursPourCompteClients: MonetaryAmount;
    readonly honorairesRetrocedes: MonetaryAmount;
    readonly produitsFinanciers: MonetaryAmount;
    readonly gainsExceptionnels: MonetaryAmount;
    readonly totalRecettes: MonetaryAmount;
    readonly achats: MonetaryAmount;
    readonly fournitures: MonetaryAmount;
    readonly loyersEtChargesLocatives: MonetaryAmount;
    readonly travauxEntretien: MonetaryAmount;
    readonly primesAssurances: MonetaryAmount;
    readonly transportEtDeplacements: MonetaryAmount;
    readonly chargesLocatives: MonetaryAmount;
    readonly autresServiceExternes: MonetaryAmount;
    readonly fraisReception: MonetaryAmount;
    readonly fournituresDeBureau: MonetaryAmount;
    readonly documentationEtFormation: MonetaryAmount;
    readonly fraisPostaux: MonetaryAmount;
    readonly cotisationsSociales: MonetaryAmount;
    readonly taxesProfessionnelles: MonetaryAmount;
    readonly chargesFinancieres: MonetaryAmount;
    readonly pertesExceptionnelles: MonetaryAmount;
    readonly totalDepenses: MonetaryAmount;
    readonly beneficeOuDeficit: MonetaryAmount;
};
export type Immo2035Line = {
    readonly nature: string;
    readonly dateAcquisition: Date;
    readonly valeurOrigine: MonetaryAmount;
    readonly dureeAmortissement: number;
    readonly amortissementAnnee: MonetaryAmount;
    readonly amortissementsCumules: MonetaryAmount;
    readonly valeurNette: MonetaryAmount;
};
export type Form2035B = {
    readonly _tag: "Form2035B";
    readonly immobilisations: readonly Immo2035Line[];
    readonly totalValeurOrigine: MonetaryAmount;
    readonly totalAmortissementAnnee: MonetaryAmount;
    readonly totalAmortissementsCumules: MonetaryAmount;
    readonly totalValeurNette: MonetaryAmount;
};
//# sourceMappingURL=models.d.ts.map