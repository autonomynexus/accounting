/**
 * 2035 BNC Computation — Pure functions
 * Cash-basis accounting for profession libérale
 */
import type { MonetaryAmount } from "../models.js";
import type { Form2035, Form2035A, Form2035B, Immo2035Line } from "./models.js";
export type Compute2035AInput = {
    readonly recettesEncaissees: MonetaryAmount;
    readonly deboursPourCompteClients?: MonetaryAmount;
    readonly honorairesRetrocedes?: MonetaryAmount;
    readonly produitsFinanciers?: MonetaryAmount;
    readonly gainsExceptionnels?: MonetaryAmount;
    readonly achats?: MonetaryAmount;
    readonly fournitures?: MonetaryAmount;
    readonly loyersEtChargesLocatives?: MonetaryAmount;
    readonly travauxEntretien?: MonetaryAmount;
    readonly primesAssurances?: MonetaryAmount;
    readonly transportEtDeplacements?: MonetaryAmount;
    readonly chargesLocatives?: MonetaryAmount;
    readonly autresServiceExternes?: MonetaryAmount;
    readonly fraisReception?: MonetaryAmount;
    readonly fournituresDeBureau?: MonetaryAmount;
    readonly documentationEtFormation?: MonetaryAmount;
    readonly fraisPostaux?: MonetaryAmount;
    readonly cotisationsSociales?: MonetaryAmount;
    readonly taxesProfessionnelles?: MonetaryAmount;
    readonly chargesFinancieres?: MonetaryAmount;
    readonly pertesExceptionnelles?: MonetaryAmount;
};
export declare function compute2035A(input: Compute2035AInput): Form2035A;
export declare function compute2035B(immobilisations: readonly Immo2035Line[]): Form2035B;
export declare function compute2035(input: Compute2035AInput & {
    readonly siren: string;
    readonly denomination: string;
    readonly activite: string;
    readonly exerciceDateDebut: Date;
    readonly exerciceDateFin: Date;
    readonly immobilisations: readonly Immo2035Line[];
}): Form2035;
//# sourceMappingURL=computation.d.ts.map