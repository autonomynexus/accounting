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
] as const

export type TaxeAssimileeType = (typeof TAXE_ASSIMILEE_TYPES)[number]

// 3310-TIC: Accise (excise tax) types
export const ACCISE_TYPES = [
  "TICFE", // Taxe intérieure consommation finale électricité
  "TICGN", // Taxe intérieure consommation gaz naturel
  "TICC", // Taxe intérieure consommation charbon
  "TICPE", // Taxe intérieure consommation produits énergétiques
] as const

export type AcciseType = (typeof ACCISE_TYPES)[number]

// TIC section types (energy categories)
export const TIC_SECTION_TYPES = [
  "ELECTRICITY",
  "GAS",
  "COAL",
  "OTHER",
] as const

export type TicSectionType = (typeof TIC_SECTION_TYPES)[number]

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
] as const

export type TicExemptionCode = (typeof TIC_EXEMPTION_CODES)[number]

// Snapshot types for JSON storage
export type ADeclarationSnapshot = {
  readonly version: string
  readonly generatedAt: string
  readonly ligne29Total: number
  readonly taxes: readonly {
    readonly taxType: string
    readonly enabled: boolean
    readonly baseImposable: number
    readonly taxeDue: number
    readonly details: Record<string, unknown>
  }[]
}

export type TerDeclarationSnapshot = {
  readonly version: string
  readonly generatedAt: string
  readonly generalDeductionPercentage: number
  readonly mentionExpresse: boolean
  readonly comments: readonly string[]
  readonly sectors: readonly {
    readonly sectorId: number
    readonly sectorNumber: number
    readonly tvaBrute: number
    readonly tvaAReverser: number
    readonly totalBrute: number
    readonly immoExclusive: number
    readonly immoNonExclusive: number
    readonly immoTotal: number
    readonly absExclusive: number
    readonly absNonExclusive: number
    readonly absTotal: number
    readonly complementTva: number
    readonly totalDeductible: number
    readonly tvaNette: number
    readonly creditTva: number
  }[]
  readonly totals: {
    readonly tvaBrute: number
    readonly totalDeductible: number
    readonly tvaNette: number
    readonly creditTva: number
  }
}

export type TicDeclarationSnapshot = {
  readonly version: string
  readonly generatedAt: string
  readonly electricityEnabled: boolean
  readonly gasEnabled: boolean
  readonly coalEnabled: boolean
  readonly otherEnabled: boolean
  readonly netBalanceDue: number
  readonly netCreditRefund: number
  readonly meters: readonly {
    readonly id: number
    readonly sectionType: string
    readonly reference: string
    readonly siret: string | null
    readonly codeApe: string | null
    readonly motifTarifReduit: string | null
    readonly closingDate: string | null
    readonly quantity: number
    readonly rate: number
    readonly deductiblePortion: number
    readonly carryover: number
    readonly netDue: number
    readonly details: Record<string, unknown>
  }[]
}
