/**
 * Exercice (Fiscal Year) Management
 */
export type ExerciceStatus = "OUVERT" | "CLOTURE_PROVISOIRE" | "CLOTURE_DEFINITIVE" | "ARCHIVE";
export type Exercice = {
    readonly id: string;
    readonly dateDebut: Date;
    readonly dateFin: Date;
    readonly status: ExerciceStatus;
    readonly dureeEnMois: number;
    readonly isPremierExercice: boolean;
    readonly exercicePrecedentId: string | null;
    readonly clotureAt: Date | null;
    readonly archiveAt: Date | null;
};
export type CreateExerciceInput = {
    readonly dateDebut: Date;
    readonly dateFin: Date;
    readonly isPremierExercice?: boolean;
    readonly exercicePrecedentId?: string;
};
/**
 * Compute exercise duration in months.
 * Counts the number of calendar months from dateDebut to dateFin (inclusive).
 * E.g., Jan 1 to Dec 31 = 12 months; Aug 1 to Dec 31 = 5 months.
 */
export declare function computeDureeEnMois(dateDebut: Date, dateFin: Date): number;
/**
 * Validate exercise dates.
 * - Standard exercises: max 12 months
 * - First exercise only: max 24 months (per Code de Commerce)
 */
export declare function validateExercice(input: CreateExerciceInput): readonly string[];
//# sourceMappingURL=models.d.ts.map