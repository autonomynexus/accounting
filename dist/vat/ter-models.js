/**
 * VAT TER Models (3310-TER)
 *
 * Domain types for "Secteurs d'Activité Distincts" annexe
 * Required when business has activities with different VAT deduction rights
 *
 * @see CGI Art. 271 - "Secteurs distincts d'activité"
 * @see docs/plans/vat-annexes-data-model.md
 */
// ============================================================================
// Snapshot Conversion
// ============================================================================
import { EUR, monetary } from "monetary";
/**
 * Convert TerDeclaration to storable snapshot
 */
export function toTerSnapshot(ter) {
    const sectorsData = ter.sectors.map((sector, index) => {
        const brute = ter.vatBrute.find((b) => b.sectorId === sector.id);
        const deductible = ter.vatDeductible.find((d) => d.sectorId === sector.id);
        const result = ter.results.find((r) => r.sectorId === sector.id);
        return {
            sectorId: sector.id,
            sectorNumber: index + 1,
            tvaBrute: brute?.tvaBrute.amount ?? 0,
            tvaAReverser: brute?.tvaAReverser.amount ?? 0,
            totalBrute: brute?.total.amount ?? 0,
            immoExclusive: deductible?.immoExclusive.amount ?? 0,
            immoNonExclusive: deductible?.immoNonExclusive.amount ?? 0,
            immoTotal: deductible?.immoTotal.amount ?? 0,
            absExclusive: deductible?.absExclusive.amount ?? 0,
            absNonExclusive: deductible?.absNonExclusive.amount ?? 0,
            absTotal: deductible?.absTotal.amount ?? 0,
            complementTva: result?.complementTvaDeductible.amount ?? 0,
            totalDeductible: result?.totalTvaDeductible.amount ?? 0,
            tvaNette: result?.tvaNette.amount ?? 0,
            creditTva: result?.creditTva.amount ?? 0,
        };
    });
    return {
        version: "1.0",
        generatedAt: new Date().toISOString(),
        generalDeductionPercentage: ter.generalDeductionPercentage,
        mentionExpresse: ter.mentionExpresse,
        comments: ter.comments,
        sectors: sectorsData,
        totals: {
            tvaBrute: ter.totals.tvaBrute.amount,
            totalDeductible: ter.totals.totalTvaDeductible.amount,
            tvaNette: ter.totals.tvaNette.amount,
            creditTva: ter.totals.creditTva.amount,
        },
    };
}
/**
 * Helper to create zero monetary value
 */
const zeroEur = () => monetary({ amount: 0, currency: EUR });
/**
 * Convert snapshot back to TerDeclaration
 */
export function fromTerSnapshot(snapshot, sectorConfigs) {
    const sectors = snapshot.sectors.map((s) => {
        const config = sectorConfigs.find((c) => c.id === s.sectorId);
        return {
            id: s.sectorId,
            description: config?.name ?? `Sector ${s.sectorNumber}`,
            deductionPercentage: config?.deductionPercentage ?? 100,
        };
    });
    const vatBrute = snapshot.sectors.map((s) => ({
        sectorId: s.sectorId,
        tvaBrute: monetary({ amount: s.tvaBrute, currency: EUR }),
        tvaAReverser: monetary({ amount: s.tvaAReverser, currency: EUR }),
        total: monetary({ amount: s.totalBrute, currency: EUR }),
    }));
    const vatDeductible = snapshot.sectors.map((s) => ({
        sectorId: s.sectorId,
        immoExclusive: monetary({ amount: s.immoExclusive, currency: EUR }),
        immoNonExclusive: monetary({ amount: s.immoNonExclusive, currency: EUR }),
        immoTotal: monetary({ amount: s.immoTotal, currency: EUR }),
        absExclusive: monetary({ amount: s.absExclusive, currency: EUR }),
        absNonExclusive: monetary({ amount: s.absNonExclusive, currency: EUR }),
        absTotal: monetary({ amount: s.absTotal, currency: EUR }),
    }));
    const results = snapshot.sectors.map((s) => ({
        sectorId: s.sectorId,
        complementTvaDeductible: monetary({
            amount: s.complementTva,
            currency: EUR,
        }),
        totalTvaDeductible: monetary({ amount: s.totalDeductible, currency: EUR }),
        tvaNette: monetary({ amount: s.tvaNette, currency: EUR }),
        creditTva: monetary({ amount: s.creditTva, currency: EUR }),
    }));
    const totals = {
        tvaBrute: monetary({ amount: snapshot.totals.tvaBrute, currency: EUR }),
        tvaAReverser: zeroEur(), // Calculate from sectors if needed
        totalBrute: monetary({ amount: snapshot.totals.tvaBrute, currency: EUR }),
        immoTotal: zeroEur(), // Calculate from sectors if needed
        absTotal: zeroEur(), // Calculate from sectors if needed
        complementTvaDeductible: zeroEur(),
        totalTvaDeductible: monetary({
            amount: snapshot.totals.totalDeductible,
            currency: EUR,
        }),
        tvaNette: monetary({ amount: snapshot.totals.tvaNette, currency: EUR }),
        creditTva: monetary({ amount: snapshot.totals.creditTva, currency: EUR }),
    };
    return {
        generalDeductionPercentage: snapshot.generalDeductionPercentage,
        sectors,
        vatBrute,
        vatDeductible,
        results,
        totals,
        mentionExpresse: snapshot.mentionExpresse,
        comments: [...snapshot.comments],
    };
}
//# sourceMappingURL=ter-models.js.map