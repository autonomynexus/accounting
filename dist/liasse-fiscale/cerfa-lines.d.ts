/**
 * CERFA Line Code Mapping for Liasse Fiscale (IS — Régime Normal)
 *
 * Canonical line codes per official CERFA forms:
 *   - 2050 (Bilan Actif): CERFA 10937, lines AA–EK
 *   - 2051 (Bilan Passif): CERFA 10938, lines DA–FL
 *   - 2052 (Compte de Résultat — Charges): CERFA 10167, lines FA–GG
 *   - 2053 (Compte de Résultat — Produits): CERFA 10168, lines HA–HN
 *
 * Source: DGFiP CERFA forms 2024/2025 — liasse fiscale BIC/IS régime réel normal.
 * Each line code is the two-letter code printed on the official form.
 */
import type { MonetaryAmount } from "../models.js";
/**
 * Line codes for CERFA 2050 — Bilan Actif.
 * Source: CERFA 10937*25 (2024 edition), DGFiP.
 *
 * The 2050 has 3 columns per line: Brut, Amortissements/Provisions, Net.
 * Lines AA–CX are individual asset categories; lines CO–EE are subtotals/totals.
 */
export type Form2050Line = "AA" | "AB" | "AC" | "AD" | "AE" | "AF" | "AG" | "AH" | "AI" | "AJ" | "AK" | "AL" | "AM" | "AN" | "AO" | "AP" | "AQ" | "AR" | "AS" | "AT" | "AU" | "AV" | "AW" | "AX" | "AY" | "AZ" | "BA" | "BB" | "BC" | "BD" | "BE" | "BF" | "BG" | "BH" | "BI" | "BJ";
/**
 * Value structure for CERFA 2050 lines.
 * The 2050 has 3 value columns (Brut, Amortissements/Provisions, Net)
 * plus an optional N-1 Net column.
 */
export type Form2050LineValue = {
    readonly brut: MonetaryAmount;
    readonly amortissementsProvisions: MonetaryAmount;
    readonly net: MonetaryAmount;
    readonly netN1?: MonetaryAmount;
};
/**
 * Line codes for CERFA 2051 — Bilan Passif.
 * Source: CERFA 10938*25 (2024 edition), DGFiP.
 */
export type Form2051Line = "DA" | "DB" | "DC" | "DD" | "DE" | "DF" | "DG" | "DH" | "DI" | "DJ" | "DK" | "DL" | "DM" | "DN" | "DO" | "DP" | "DQ" | "DR" | "DS" | "DT" | "DU" | "DV" | "DW" | "DX" | "DY" | "DZ" | "EA" | "EB" | "EC" | "ED" | "EE";
/**
 * Value structure for CERFA 2051 lines.
 * The 2051 has 2 value columns: Montant N, Montant N-1.
 */
export type Form2051LineValue = {
    readonly montant: MonetaryAmount;
    readonly montantN1?: MonetaryAmount;
};
/**
 * Line codes for CERFA 2052 — Compte de Résultat (Charges).
 * Source: CERFA 10167*25 (2024 edition), DGFiP.
 */
export type Form2052Line = "FA" | "FB" | "FC" | "FD" | "FE" | "FF" | "FG" | "FH" | "FI" | "FJ" | "FK" | "FL" | "FM" | "FN" | "FO" | "FP" | "FQ" | "FR" | "FS" | "FT" | "FU" | "FV" | "FW" | "FX" | "FY" | "FZ" | "GA" | "GB" | "GC" | "GD" | "GE" | "GF" | "GG";
/**
 * Value structure for CERFA 2052 lines.
 * The 2052 has 2 value columns: Montant N, Montant N-1.
 */
export type Form2052LineValue = {
    readonly montant: MonetaryAmount;
    readonly montantN1?: MonetaryAmount;
};
/**
 * Line codes for CERFA 2053 — Compte de Résultat (Produits).
 * Source: CERFA 10168*25 (2024 edition), DGFiP.
 */
export type Form2053Line = "HA" | "HB" | "HC" | "HD" | "HE" | "HF" | "HG" | "HH" | "HI" | "HJ" | "HK" | "HL" | "HM" | "HN";
/**
 * Value structure for CERFA 2053 lines.
 * The 2053 has 2 value columns: Montant N, Montant N-1.
 */
export type Form2053LineValue = {
    readonly montant: MonetaryAmount;
    readonly montantN1?: MonetaryAmount;
};
/**
 * French labels for all CERFA line codes across forms 2050-2053.
 * Used for rendering, export, and human-readable output.
 */
export declare const CERFA_LINE_LABELS: Record<Form2050Line | Form2051Line | Form2052Line | Form2053Line, string>;
/**
 * Form 2050 data indexed by CERFA line code.
 * Each entry maps a line code to its Brut/Amort/Net values.
 */
export type Form2050CerfaData = Partial<Record<Form2050Line, Form2050LineValue>>;
/**
 * Form 2051 data indexed by CERFA line code.
 */
export type Form2051CerfaData = Partial<Record<Form2051Line, Form2051LineValue>>;
/**
 * Form 2052 data indexed by CERFA line code.
 */
export type Form2052CerfaData = Partial<Record<Form2052Line, Form2052LineValue>>;
/**
 * Form 2053 data indexed by CERFA line code.
 */
export type Form2053CerfaData = Partial<Record<Form2053Line, Form2053LineValue>>;
//# sourceMappingURL=cerfa-lines.d.ts.map