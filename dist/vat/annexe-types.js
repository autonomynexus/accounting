/**
 * Types originally from myautonomy DB schema (vat-annexes)
 * Redefined here to avoid DB coupling
 */
// 3310-A: Taxe assimilée types
export const TAXE_ASSIMILEE_TYPES = [
    "TRANSPORT_INFRASTRUCTURE",
    "METAUX_PRECIEUX",
    "VIDEOGRAMMES",
    "JEUX_PARIS",
    "RENTE_ELECTRICITE",
    "VEHICULES_LOURDS",
    "PASSAGERS_CORSE",
    "EMISSIONS_CO2",
    "EOLIENNES_MARITIMES",
    "EXPLORATION_HYDROCARBURES",
    "TSN_NUMERIQUE",
    "PUBLICITE",
    "DROITS_SPORTIFS",
    "PROVISIONS_ASSURANCE",
    "REDEVANCE_SANITAIRE_PHYTOSANITAIRE",
    "EAUX_MINERALES_NATURELLES",
    "PRODUITS_PHYTOPHARMACEUTIQUES",
];
// 3310-TIC: Accise (excise tax) types
export const ACCISE_TYPES = [
    "TICFE", // Taxe intérieure consommation finale électricité
    "TICGN", // Taxe intérieure consommation gaz naturel
    "TICC", // Taxe intérieure consommation charbon
    "TICPE", // Taxe intérieure consommation produits énergétiques
];
// TIC section types (energy categories)
export const TIC_SECTION_TYPES = ["ELECTRICITY", "GAS", "COAL", "OTHER"];
// TIC exemption codes (E08-E22 per French tax code)
export const TIC_EXEMPTION_CODES = [
    "E08",
    "E09",
    "E10",
    "E11",
    "E12",
    "E13",
    "E14",
    "E15",
    "E16",
    "E17",
    "E18",
    "E19",
    "E20",
    "E21",
    "E22",
];
//# sourceMappingURL=annexe-types.js.map