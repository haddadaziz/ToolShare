const AppError = require('./appError');

/**
 * Utilitaires pour la manipulation et la validation temporelle des réservations
 */

/**
 * Calcule la date de fin à partir d'une date de début et d'une durée en heures.
 * @param {Date|string} startDate
 * @param {number} durationHours
 * @returns {Date}
 */
function calculateEndDate(startDate, durationHours) {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    return end;
}

/**
 * Calcule la durée en heures (avec décimales) entre deux dates.
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {number}
 */
function calculateDurationHours(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

/**
 * Algorithme d'intersection d'intervalles :
 * Retourne true si les intervalles [startA, endA] et [startB, endB] se chevauchent.
 * Condition : startA < endB ET endA > startB
 * @param {Date|string} startA
 * @param {Date|string} endA
 * @param {Date|string} startB
 * @param {Date|string} endB
 * @returns {boolean}
 */
function isOverlapping(startA, endA, startB, endB) {
    const sA = new Date(startA).getTime();
    const eA = new Date(endA).getTime();
    const sB = new Date(startB).getTime();
    const eB = new Date(endB).getTime();

    return sA < eB && eA > sB;
}

/**
 * Valide qu'un créneau demandé ne chevauche aucune réservation existante active.
 * Lève une AppError 409 si un conflit est détecté.
 * @param {Array} existingReservations - Liste des réservations existantes pour l'outil
 * @param {Date|string} newStartDate - Date de début demandée
 * @param {Date|string} newEndDate - Date de fin demandée
 * @param {string|null} excludeReservationId - ID de la réservation à exclure (en cas d'édition)
 * @returns {boolean}
 */
function validateNoOverlap(existingReservations = [], newStartDate, newEndDate, excludeReservationId = null) {
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    // Vérification de la cohérence chronologique
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        throw new AppError('Les dates fournies sont invalides.', 400);
    }
    if (newStart >= newEnd) {
        throw new AppError('La date de début doit être strictement antérieure à la date de fin.', 400);
    }

    // Recherche d'un conflit parmi les réservations actives
    const conflict = existingReservations.find(res => {
        // Ignorer les réservations annulées ou terminées
        if (['ANNULEE', 'TERMINEE'].includes(res.status)) return false;

        // Ignorer la réservation elle-même si on fait une modification
        if (excludeReservationId && res._id && res._id.toString() === excludeReservationId.toString()) {
            return false;
        }

        // Vérifier le chevauchement avec l'algorithme
        return isOverlapping(res.startDate, res.endDate, newStart, newEnd);
    });

    if (conflict) {
        throw new AppError(
            `Conflit de réservation : Cet équipement est déjà réservé du ${new Date(conflict.startDate).toISOString()} au ${new Date(conflict.endDate).toISOString()}.`,
            409
        );
    }

    return true;
}

module.exports = {
    calculateEndDate,
    calculateDurationHours,
    isOverlapping,
    validateNoOverlap
};
