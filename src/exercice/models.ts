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

/** Compute exercise duration in months */
export function computeDureeEnMois(dateDebut: Date, dateFin: Date): number {
  const years = dateFin.getFullYear() - dateDebut.getFullYear();
  const months = dateFin.getMonth() - dateDebut.getMonth();
  const days = dateFin.getDate() - dateDebut.getDate();
  return years * 12 + months + (days >= 0 ? 1 : 0);
}

/** Validate exercise dates */
export function validateExercice(input: CreateExerciceInput): readonly string[] {
  const errors: string[] = [];
  if (input.dateFin <= input.dateDebut) {
    errors.push("La date de fin doit être postérieure à la date de début");
  }
  const duree = computeDureeEnMois(input.dateDebut, input.dateFin);
  if (duree > 24) {
    errors.push("L'exercice ne peut pas dépasser 24 mois");
  }
  if (duree < 1) {
    errors.push("L'exercice doit durer au moins 1 mois");
  }
  return errors;
}
