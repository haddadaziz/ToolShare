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

module.exports = {
    calculateEndDate,
    calculateDurationHours,
    isOverlapping
};
