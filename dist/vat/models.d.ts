import type { VatCode } from "./utils.js";
import type { Monetary } from "monetary";
import type { UserId } from "../models.js";
import type { Period } from "../models.js";
/**
 * French VAT regime types
 */
export type VatRegime = "franchise" | "reel_simplifie" | "reel_normal";
/**
 * VAT declaration frequency
 */
export type VatDeclarationFrequency = "monthly" | "quarterly" | "annual";
/**
 * Input for computing VAT declaration
 */
export type ComputeVatDeclarationInput = {
    readonly userId: UserId;
    readonly period: Period;
    readonly regime: VatRegime;
};
/**
 * VAT amounts by rate
 */
export type VatByRate = {
    readonly code: VatCode;
    readonly collected: Monetary<number>;
    readonly deductible: Monetary<number>;
    readonly net: Monetary<number>;
};
/**
 * VAT totals breakdown
 */
export type VatTotals = {
    readonly totalCollected: Monetary<number>;
    readonly totalDeductible: Monetary<number>;
    readonly netVat: Monetary<number>;
};
/**
 * Complete VAT declaration result
 */
export type VatDeclarationResult = {
    readonly period: Period;
    readonly regime: VatRegime;
    readonly byRate: readonly VatByRate[];
    readonly totals: VatTotals;
    readonly isCredit: boolean;
};
/**
 * CA3 TVA line with base HT and calculated TVA
 * Used for lignes 08-11 which require both base and tax amount
 */
export type Ca3TvaLine = {
    readonly base: Monetary<number>;
    readonly tva: Monetary<number>;
};
/**
 * CA3 declaration (monthly/quarterly for régime réel normal)
 * Official form: 3310-CA3-SD (CERFA 10963)
 * Legal basis: CGI Art. 287
 *
 * All 32 lines included. Lines without data source default to zero.
 * @see docs/vat-declaration-ca3.md for complete documentation
 */
export type Ca3Declaration = {
    readonly ligne01: Monetary<number>;
    readonly ligne02: Monetary<number>;
    readonly ligne03: Monetary<number>;
    readonly ligne3A: Monetary<number>;
    readonly ligne3B: Monetary<number>;
    readonly ligne04: Monetary<number>;
    readonly ligne05: Monetary<number>;
    readonly ligne06: Monetary<number>;
    readonly ligne6A: Monetary<number>;
    readonly ligne07: Monetary<number>;
    readonly ligne08: Ca3TvaLine;
    readonly ligne09: Ca3TvaLine;
    readonly ligne9B: Ca3TvaLine;
    readonly ligne10: Ca3TvaLine;
    readonly ligne11: Ca3TvaLine;
    readonly ligne13: Monetary<number>;
    readonly ligne14: Monetary<number>;
    readonly ligne15: Monetary<number>;
    readonly ligne16: Monetary<number>;
    readonly ligne17: Monetary<number>;
    readonly ligne18: Monetary<number>;
    readonly ligne19: Monetary<number>;
    readonly ligne20: Monetary<number>;
    readonly ligne21: Monetary<number>;
    readonly ligne22: Monetary<number>;
    readonly ligne23: Monetary<number>;
    readonly ligne25: Monetary<number>;
    readonly ligne26: Monetary<number>;
    readonly ligne27: Monetary<number>;
    readonly ligne28: Monetary<number>;
    readonly ligne29: Monetary<number>;
    readonly ligne30: Monetary<number>;
    readonly ligne31: Monetary<number>;
    readonly ligne32: Monetary<number>;
};
/**
 * Input for generating CA3 declaration
 */
export type GenerateCa3Input = {
    readonly userId: UserId;
    readonly period: Period;
    readonly previousCredit?: Monetary<number>;
};
/**
 * JSON-serializable version of Ca3Declaration for storage
 * Amounts stored as cents (number) instead of Monetary objects
 */
export type Ca3DeclarationSnapshot = {
    readonly version: string;
    readonly generatedAt: string;
    readonly periodStart: string;
    readonly periodEnd: string;
    readonly ligne01: number;
    readonly ligne02: number;
    readonly ligne03: number;
    readonly ligne3A: number;
    readonly ligne3B: number;
    readonly ligne04: number;
    readonly ligne05: number;
    readonly ligne06: number;
    readonly ligne6A: number;
    readonly ligne07: number;
    readonly ligne08_base: number;
    readonly ligne08_tva: number;
    readonly ligne09_base: number;
    readonly ligne09_tva: number;
    readonly ligne9B_base: number;
    readonly ligne9B_tva: number;
    readonly ligne10_base: number;
    readonly ligne10_tva: number;
    readonly ligne11_base: number;
    readonly ligne11_tva: number;
    readonly ligne13: number;
    readonly ligne14: number;
    readonly ligne15: number;
    readonly ligne16: number;
    readonly ligne17: number;
    readonly ligne18: number;
    readonly ligne19: number;
    readonly ligne20: number;
    readonly ligne21: number;
    readonly ligne22: number;
    readonly ligne23: number;
    readonly ligne25: number;
    readonly ligne26: number;
    readonly ligne27: number;
    readonly ligne28: number;
    readonly ligne29: number;
    readonly ligne30: number;
    readonly ligne31: number;
    readonly ligne32: number;
};
/**
 * CA12 TVA line with base HT and calculated TVA (same as CA3)
 * Used for lines 5A-5C which require both base and tax amount
 */
export type Ca12TvaLine = {
    readonly base: Monetary<number>;
    readonly tva: Monetary<number>;
};
/**
 * CA12 declaration (annual for régime simplifié)
 * Official form: 3517-S-SD (CERFA 11417)
 * Legal basis: CGI Art. 302 septies A
 *
 * Simplified annual declaration for régime réel simplifié.
 * @see docs/vat-declaration-ca3.md for related documentation
 */
export type Ca12Declaration = {
    readonly exerciceStart: Date;
    readonly exerciceEnd: Date;
    readonly ligne01: Monetary<number>;
    readonly ligne02: Monetary<number>;
    readonly ligne03: Monetary<number>;
    readonly ligne3A: Monetary<number>;
    readonly ligne04: Monetary<number>;
    readonly ligne5A: Ca12TvaLine;
    readonly ligne5B: Ca12TvaLine;
    readonly ligne5C: Ca12TvaLine;
    readonly ligne06: Ca12TvaLine;
    readonly ligne07: Ca12TvaLine;
    readonly ligne08: Ca12TvaLine;
    readonly ligne09: Ca12TvaLine;
    readonly ligne10: Monetary<number>;
    readonly ligneAA: Monetary<number>;
    readonly ligneAB: Monetary<number>;
    readonly ligneAC: Monetary<number>;
    readonly ligne11: Monetary<number>;
    readonly ligne12: Monetary<number>;
    readonly ligne19: Monetary<number>;
    readonly ligne20: Monetary<number>;
    readonly ligne21: Monetary<number>;
    readonly ligne22: Monetary<number>;
    readonly ligne23: Monetary<number>;
    readonly ligne24: Monetary<number>;
    readonly ligne25: Monetary<number>;
    readonly ligne26: Monetary<number>;
    readonly ligne27: Monetary<number>;
    readonly ligne28: Monetary<number>;
    readonly ligne29: Monetary<number>;
    readonly ligne30: Monetary<number>;
    readonly ligne31: Monetary<number>;
    readonly ligne32: Monetary<number>;
    readonly ligne33: Monetary<number>;
    readonly ligne34: Monetary<number>;
    readonly acompteJuillet: Monetary<number>;
    readonly acompteDécembre: Monetary<number>;
    readonly baseAcomptesSuivants: Monetary<number>;
};
/**
 * Input for generating CA12 declaration
 */
export type GenerateCa12Input = {
    readonly userId: UserId;
    readonly exercice: {
        readonly startDate: Date;
        readonly endDate: Date;
    };
    readonly previousCredit?: Monetary<number>;
    readonly acompteJuillet?: Monetary<number>;
    readonly acompteDécembre?: Monetary<number>;
};
/**
 * JSON-serializable version of Ca12Declaration for storage
 */
export type Ca12DeclarationSnapshot = {
    readonly version: string;
    readonly generatedAt: string;
    readonly exerciceStart: string;
    readonly exerciceEnd: string;
    readonly ligne01: number;
    readonly ligne02: number;
    readonly ligne03: number;
    readonly ligne3A: number;
    readonly ligne04: number;
    readonly ligne5A_base: number;
    readonly ligne5A_tva: number;
    readonly ligne5B_base: number;
    readonly ligne5B_tva: number;
    readonly ligne5C_base: number;
    readonly ligne5C_tva: number;
    readonly ligne06_base: number;
    readonly ligne06_tva: number;
    readonly ligne07_base: number;
    readonly ligne07_tva: number;
    readonly ligne08_base: number;
    readonly ligne08_tva: number;
    readonly ligne09_base: number;
    readonly ligne09_tva: number;
    readonly ligne10: number;
    readonly ligneAA: number;
    readonly ligneAB: number;
    readonly ligneAC: number;
    readonly ligne11: number;
    readonly ligne12: number;
    readonly ligne19: number;
    readonly ligne20: number;
    readonly ligne21: number;
    readonly ligne22: number;
    readonly ligne23: number;
    readonly ligne24: number;
    readonly ligne25: number;
    readonly ligne26: number;
    readonly ligne27: number;
    readonly ligne28: number;
    readonly ligne29: number;
    readonly ligne30: number;
    readonly ligne31: number;
    readonly ligne32: number;
    readonly ligne33: number;
    readonly ligne34: number;
    readonly acompteJuillet: number;
    readonly acompteDécembre: number;
    readonly baseAcomptesSuivants: number;
};
/**
 * Convert Ca3Declaration to storable snapshot
 */
export declare function toCA3Snapshot(ca3: Ca3Declaration, period: Period): Ca3DeclarationSnapshot;
/**
 * Convert Ca12Declaration to storable snapshot
 */
export declare function toCA12Snapshot(ca12: Ca12Declaration): Ca12DeclarationSnapshot;
import type { ADeclaration } from "./annexe-a-models.js";
import type { TerDeclaration } from "./ter-models.js";
import type { TicDeclaration } from "./tic-models.js";
/**
 * Complete CA3 declaration with all annexes
 * Extends basic CA3 with TER, A, and TIC annexes
 */
export type Ca3DeclarationFull = Ca3Declaration & {
    readonly hasTer: boolean;
    readonly hasAnnexeA: boolean;
    readonly hasTic: boolean;
    readonly ter: TerDeclaration | null;
    readonly annexeA: ADeclaration | null;
    readonly tic: TicDeclaration | null;
};
/**
 * Check if CA3 declaration includes annexes
 */
export declare function hasAnyAnnexe(declaration: Ca3DeclarationFull): boolean;
/**
 * Create CA3DeclarationFull from basic CA3 (no annexes)
 */
export declare function toFullDeclaration(ca3: Ca3Declaration): Ca3DeclarationFull;
//# sourceMappingURL=models.d.ts.map