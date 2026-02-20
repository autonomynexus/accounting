/**
 * Exercice (Fiscal Year) Management
 */
/**
 * Compute exercise duration in months.
 * Counts the number of calendar months from dateDebut to dateFin (inclusive).
 * E.g., Jan 1 to Dec 31 = 12 months; Aug 1 to Dec 31 = 5 months.
 */
export function computeDureeEnMois(dateDebut, dateFin) {
    // Move to the 1st of the start month and 1st of the month after dateFin
    const startYear = dateDebut.getFullYear();
    const startMonth = dateDebut.getMonth();
    const endYear = dateFin.getFullYear();
    const endMonth = dateFin.getMonth();
    // Number of calendar months spanned (inclusive of both start and end months)
    return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}
/**
 * Validate exercise dates.
 * - Standard exercises: max 12 months
 * - First exercise only: max 24 months (per Code de Commerce)
 */
export function validateExercice(input) {
    const errors = [];
    if (input.dateFin <= input.dateDebut) {
        errors.push("La date de fin doit être postérieure à la date de début");
    }
    const duree = computeDureeEnMois(input.dateDebut, input.dateFin);
    const isPremier = input.isPremierExercice ?? false;
    if (isPremier) {
        if (duree > 24) {
            errors.push("Le premier exercice ne peut pas dépasser 24 mois");
        }
    }
    else {
        if (duree > 12) {
            errors.push("Un exercice standard ne peut pas dépasser 12 mois (seul le premier exercice peut aller jusqu'à 24 mois)");
        }
    }
    if (duree < 1) {
        errors.push("L'exercice doit durer au moins 1 mois");
    }
    return errors;
}
//# sourceMappingURL=models.js.map