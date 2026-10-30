const AppError = require('./appError');

/**
 * Utilities for reservation time calculations and validation.
 */

/**
 * Calculates the end date from a start date and a duration in hours.
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
 * Calculates the duration in hours (including fractions) between two dates.
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
 * Interval overlap algorithm.
 * Returns true if [startA, endA] and [startB, endB] overlap.
 * Condition: startA < endB AND endA > startB.
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
 * Validates that a requested time slot does not overlap an active reservation.
 * Throws an AppError with status 409 if a conflict is detected.
 * @param {Array} existingReservations - Existing reservations for the tool.
 * @param {Date|string} newStartDate - Requested start date.
 * @param {Date|string} newEndDate - Requested end date.
 * @param {string|null} excludeReservationId - Reservation ID to exclude when editing.
 * @returns {boolean}
 */
function validateNoOverlap(existingReservations = [], newStartDate, newEndDate, excludeReservationId = null) {
    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    // Validate chronological order.
    if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        throw new AppError('The provided dates are invalid.', 400);
    }
    if (newStart >= newEnd) {
        throw new AppError('The start date must be earlier than the end date.', 400);
    }

    // Find a conflict among active reservations.
    const conflict = existingReservations.find(res => {
        // Ignore cancelled or completed reservations.
        if (['ANNULEE', 'TERMINEE'].includes(res.status)) return false;

        // Ignore the reservation itself when editing.
        if (excludeReservationId && res._id && res._id.toString() === excludeReservationId.toString()) {
            return false;
        }

        // Check for overlap.
        return isOverlapping(res.startDate, res.endDate, newStart, newEnd);
    });

    if (conflict) {
        throw new AppError(
            `Reservation conflict: This equipment is already reserved from ${new Date(conflict.startDate).toISOString()} to ${new Date(conflict.endDate).toISOString()}.`,
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
