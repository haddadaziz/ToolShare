const mongoose = require('mongoose');
const reservationRepository = require('../repositories/reservation.repository');
const equipmentRepository = require('../repositories/equipment.repository');
const storeRepository = require('../repositories/store.repository');
const { calculateEndDate, validateNoOverlap} = require('../utils/date.util');
const AppError = require('../utils/appError');

function assertManager(user) {
    if (!user || user.role !== 'MANAGER') {
        throw new AppError('Only a manager can perform this operation', 403);
    }

    if (!user.storeId) {
        throw new AppError('No store is associated with your account', 403);
    }
}

function assertValidReservationId(id) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError('Reservation ID is invalid', 400);
    }
}

function getId(value) {
    return value && value._id ? value._id.toString() : value.toString();
}

class ReservationService{
    async createReservation({toolId,storeId,startDate,durationHours,borrowerId}){
        if(!toolId || !storeId || !startDate || !durationHours){
            throw new AppError('All fields are required',400);
        }

        const start = new Date(startDate);

        if(isNaN(start.getTime())){
            throw new AppError('The start date is invalid',400);
        }

        if(start < new Date()){
            throw new AppError('Reservations cannot be made in the past',400);
        }

        const duration = Number(durationHours);
        if(isNaN(duration) || duration < 1){
            throw new AppError('The minimum reservation duration is 1 hour',400);
        }

        const store = await storeRepository.findById(storeId);
        if(!store || !store.isActive){
            throw new AppError('The selected store was not found or is inactive',404);
        }

        const end = calculateEndDate(start,duration);

        const conflicting = await reservationRepository.findConflicting(toolId,start,end);

        validateNoOverlap(conflicting,start,end);

        return await reservationRepository.create({
            toolId,
            borrowerId,
            storeId,
            startDate:start,
            endDate:end,
            durationHours:duration,
            status:'CONFIRMEE'
        });
    }

    async getReservations(filters = {},user){
        const query = {...filters};

        if(user.role === 'USER'){
            query.borrowerId = user.id;
        }
        else if(user.role === 'MANAGER'){
            if(!user.storeId){
                throw new AppError('No store is associated with your account',403);
            }
            query.storeId = user.storeId;
        }
        
        return await reservationRepository.findAll(query);
    }

    async getReservationById(id,user){
        const reservation = await reservationRepository.findById(id);
        if(!reservation) {
            throw new AppError('Reservation not found',404);
        }

        if(user.role === 'USER' && reservation.borrowerId._id.toString() !== user.id){
            throw new AppError('Access to this reservation is denied',403);
        }

        if(user.role === 'MANAGER' &&
            (!user.storeId || getId(reservation.storeId) !== user.storeId.toString())){
            throw new AppError('Access denied: this reservation does not belong to your store',403);
        }

        return reservation;
    }

    async checkOutReservation(id, user){
        assertManager(user);
        assertValidReservationId(id);

        const session = await mongoose.startSession();
        let checkedOutReservation;

        try {
            await session.withTransaction(async () => {
                const reservation = await reservationRepository.findById(id, session);

                if(!reservation){
                    throw new AppError('Reservation not found',404);
                }

                if(getId(reservation.storeId) !== user.storeId.toString()){
                    throw new AppError('You can only check out reservations from your store',403);
                }

                if(reservation.status !== 'CONFIRMEE'){
                    throw new AppError('Only confirmed reservations can be checked out',400);
                }

                const activeReservation = await reservationRepository.findActiveByTool(
                    reservation.toolId,
                    session
                );

                if(activeReservation){
                    throw new AppError('This equipment is already checked out',409);
                }

                const updatedTool = await equipmentRepository.update(
                    reservation.toolId,
                    {
                        storeId: user.storeId,
                        status: 'DISPONIBLE',
                        isActive: true
                    },
                    {status: 'INDISPONIBLE'},
                    session
                );

                if(!updatedTool){
                    throw new AppError('Equipment is not available for checkout',409);
                }

                checkedOutReservation = await reservationRepository.updateIfStatus(
                    id,
                    'CONFIRMEE',
                    {
                        status: 'EN_COURS',
                        actualStartDate: new Date(),
                        checkedOutByManagerId: user.id
                    },
                    session
                );

                if(!checkedOutReservation){
                    throw new AppError('This reservation is no longer available for checkout',409);
                }
            });
        } finally {
            await session.endSession();
        }

        return checkedOutReservation;
    }

    async checkInReservation(id, returnCondition, user){
        assertManager(user);
        assertValidReservationId(id);

        if(!['BON', 'ENDOMMAGE'].includes(returnCondition)){
            throw new AppError('Return condition must be BON or ENDOMMAGE',400);
        }

        const session = await mongoose.startSession();
        let checkedInReservation;

        try {
            await session.withTransaction(async () => {
                const reservation = await reservationRepository.findById(id, session);

                if(!reservation){
                    throw new AppError('Reservation not found',404);
                }

                if(getId(reservation.storeId) !== user.storeId.toString()){
                    throw new AppError('You can only check in reservations from your store',403);
                }

                if(reservation.status !== 'EN_COURS'){
                    throw new AppError('Only in-progress reservations can be checked in',400);
                }

                const toolStatus = returnCondition === 'ENDOMMAGE'
                    ? 'INDISPONIBLE'
                    : 'DISPONIBLE';
                const updatedTool = await equipmentRepository.update(
                    reservation.toolId,
                    { storeId: user.storeId },
                    { status: toolStatus },
                    session
                );

                if(!updatedTool){
                    throw new AppError('Equipment not found in your store',404);
                }

                checkedInReservation = await reservationRepository.update(id,{
                    status: 'TERMINEE',
                    actualEndDate: new Date(),
                    checkedInByManagerId: user.id,
                    returnCondition
                },session);

                if(!checkedInReservation){
                    throw new AppError('Reservation not found',404);
                }
            });
        } finally {
            await session.endSession();
        }

        return checkedInReservation;
    }

    async getOverdueReservations(user, now = new Date()){
        assertManager(user);
        return reservationRepository.findOverdue(user.storeId, now);
    }

    async cancelReservation(id,user){
        const reservation = await reservationRepository.findById(id);
        if(!reservation){
            throw new AppError('Reservation not found',404);
        }

        if(user.role === 'MANAGER' && reservation.storeId._id.toString() !== user.storeId){
            throw new AppError('You can only cancel reservations from your store',403);
        }

        if(reservation.status === 'ANNULEE'){
            throw new AppError('This reservation has already been canceled',400);
        }

        if(['EN_COURS','TERMINEE'].includes(reservation.status)){
            throw new AppError(`Cannot cancel a reservation with status ${reservation.status}`,400);
        }

        return await reservationRepository.update(id,{status:'ANNULEE'});
    }
}

module.exports = new ReservationService();