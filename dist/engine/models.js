/**
 * Double-Entry Bookkeeping Engine — Core Models
 *
 * Journal types, écritures comptables, lettrage, rapprochement bancaire,
 * trial balance, general ledger, subsidiary ledger.
 */
export const STANDARD_JOURNALS = {
    HA: { code: "HA", name: "Journal des achats", description: "Écritures d'achats fournisseurs" },
    VE: { code: "VE", name: "Journal des ventes", description: "Écritures de ventes clients" },
    BQ: { code: "BQ", name: "Journal de banque", description: "Écritures bancaires" },
    OD: { code: "OD", name: "Journal des opérations diverses", description: "Écritures de régularisation, TVA, paie, etc." },
    AN: { code: "AN", name: "Journal des à-nouveaux", description: "Écritures d'ouverture de l'exercice" },
    SA: { code: "SA", name: "Journal des salaires", description: "Écritures de paie" },
    EX: { code: "EX", name: "Journal des opérations exceptionnelles", description: "Écritures exceptionnelles" },
};
//# sourceMappingURL=models.js.map