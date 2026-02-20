// ============================================================================
// Snapshot Conversion Helpers
// ============================================================================
/**
 * Convert Ca3Declaration to storable snapshot
 */
export function toCA3Snapshot(ca3, period) {
    return {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        periodStart: period.startDate.toISOString(),
        periodEnd: period.endDate.toISOString(),
        ligne01: ca3.ligne01.amount,
        ligne02: ca3.ligne02.amount,
        ligne03: ca3.ligne03.amount,
        ligne3A: ca3.ligne3A.amount,
        ligne3B: ca3.ligne3B.amount,
        ligne04: ca3.ligne04.amount,
        ligne05: ca3.ligne05.amount,
        ligne06: ca3.ligne06.amount,
        ligne6A: ca3.ligne6A.amount,
        ligne07: ca3.ligne07.amount,
        ligne08_base: ca3.ligne08.base.amount,
        ligne08_tva: ca3.ligne08.tva.amount,
        ligne09_base: ca3.ligne09.base.amount,
        ligne09_tva: ca3.ligne09.tva.amount,
        ligne9B_base: ca3.ligne9B.base.amount,
        ligne9B_tva: ca3.ligne9B.tva.amount,
        ligne10_base: ca3.ligne10.base.amount,
        ligne10_tva: ca3.ligne10.tva.amount,
        ligne11_base: ca3.ligne11.base.amount,
        ligne11_tva: ca3.ligne11.tva.amount,
        ligne13: ca3.ligne13.amount,
        ligne14: ca3.ligne14.amount,
        ligne15: ca3.ligne15.amount,
        ligne16: ca3.ligne16.amount,
        ligne17: ca3.ligne17.amount,
        ligne18: ca3.ligne18.amount,
        ligne19: ca3.ligne19.amount,
        ligne20: ca3.ligne20.amount,
        ligne21: ca3.ligne21.amount,
        ligne22: ca3.ligne22.amount,
        ligne23: ca3.ligne23.amount,
        ligne25: ca3.ligne25.amount,
        ligne26: ca3.ligne26.amount,
        ligne27: ca3.ligne27.amount,
        ligne28: ca3.ligne28.amount,
        ligne29: ca3.ligne29.amount,
        ligne30: ca3.ligne30.amount,
        ligne31: ca3.ligne31.amount,
        ligne32: ca3.ligne32.amount,
    };
}
/**
 * Convert Ca12Declaration to storable snapshot
 */
export function toCA12Snapshot(ca12) {
    return {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        exerciceStart: ca12.exerciceStart.toISOString(),
        exerciceEnd: ca12.exerciceEnd.toISOString(),
        ligne01: ca12.ligne01.amount,
        ligne02: ca12.ligne02.amount,
        ligne03: ca12.ligne03.amount,
        ligne3A: ca12.ligne3A.amount,
        ligne04: ca12.ligne04.amount,
        ligne5A_base: ca12.ligne5A.base.amount,
        ligne5A_tva: ca12.ligne5A.tva.amount,
        ligne5B_base: ca12.ligne5B.base.amount,
        ligne5B_tva: ca12.ligne5B.tva.amount,
        ligne5C_base: ca12.ligne5C.base.amount,
        ligne5C_tva: ca12.ligne5C.tva.amount,
        ligne06_base: ca12.ligne06.base.amount,
        ligne06_tva: ca12.ligne06.tva.amount,
        ligne07_base: ca12.ligne07.base.amount,
        ligne07_tva: ca12.ligne07.tva.amount,
        ligne08_base: ca12.ligne08.base.amount,
        ligne08_tva: ca12.ligne08.tva.amount,
        ligne09_base: ca12.ligne09.base.amount,
        ligne09_tva: ca12.ligne09.tva.amount,
        ligne10: ca12.ligne10.amount,
        ligneAA: ca12.ligneAA.amount,
        ligneAB: ca12.ligneAB.amount,
        ligneAC: ca12.ligneAC.amount,
        ligne11: ca12.ligne11.amount,
        ligne12: ca12.ligne12.amount,
        ligne19: ca12.ligne19.amount,
        ligne20: ca12.ligne20.amount,
        ligne21: ca12.ligne21.amount,
        ligne22: ca12.ligne22.amount,
        ligne23: ca12.ligne23.amount,
        ligne24: ca12.ligne24.amount,
        ligne25: ca12.ligne25.amount,
        ligne26: ca12.ligne26.amount,
        ligne27: ca12.ligne27.amount,
        ligne28: ca12.ligne28.amount,
        ligne29: ca12.ligne29.amount,
        ligne30: ca12.ligne30.amount,
        ligne31: ca12.ligne31.amount,
        ligne32: ca12.ligne32.amount,
        ligne33: ca12.ligne33.amount,
        ligne34: ca12.ligne34.amount,
        acompteJuillet: ca12.acompteJuillet.amount,
        acompteDécembre: ca12.acompteDécembre.amount,
        baseAcomptesSuivants: ca12.baseAcomptesSuivants.amount,
    };
}
/**
 * Check if CA3 declaration includes annexes
 */
export function hasAnyAnnexe(declaration) {
    return declaration.hasTer || declaration.hasAnnexeA || declaration.hasTic;
}
/**
 * Create CA3DeclarationFull from basic CA3 (no annexes)
 */
export function toFullDeclaration(ca3) {
    return {
        ...ca3,
        hasTer: false,
        hasAnnexeA: false,
        hasTic: false,
        ter: null,
        annexeA: null,
        tic: null,
    };
}
//# sourceMappingURL=models.js.map