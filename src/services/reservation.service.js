const reservationRepository = require('../repositories/reservation.repository');
const storeRepository = require('../repositories/store.repository');
const { calculateEndDate, validateNoOverlap} = require('../utils/date.util');
const AppError = require('../utils/appError');

class ReservationService{
    async createReservation({toolId,storeId,startDate,durationHours,borrowerId}){
        if(!toolId || !storeId || !startDate || !durationHours){
            throw new AppError('Les champs sont obligatoires',400);
        }

        const start = new Date(startDate);

        if(isNaN(start.getTime())){
            throw new AppError('La date de debut est invalide',400);
        }

        if(start < new Date()){
            throw new AppError('La réservation ne peut pas etre effectuee dans le passé',400);
        }

        const duration = Number(durationHours);
        if(isNaN(duration) || duration < 1){
            throw new AppError('La durée minimale de réservation est de 1h',400);
        }

        const store = await storeRepository.findById(storeId);
        if(!store || !store.isActive){
            throw new AppError('Le magasin selectionne est introuvable ou inactif',404);
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
        else if(user.role === 'GESTIONNAIRE'){
            if(!user.storeId){
                throw new AppError('Aucun magasin n est associe a votre comptre',403);
            }
            query.storeId = user.storeId;
        }
        
        return await reservationRepository.findAll(query);
    }

    async getReservationById(id,user){
        const reservation = await reservationRepository.findById(id);
        if(!reservation) {
            throw new AppError('Reservation introuvable',404);
        }

        if(user.role === 'USER' && reservation.borrowerId._id.toString() !== user.id){
            throw new AppError('Acces refusé a cette reservation',403);
        }

        if(user.role === 'GESTIONNAIRE' && reservation.storeId._id.toString() !== user.storeId){
            throw new AppError('Acces refusé, cette reservation n appartient pas a votre magasin',403);

            return reservation;
        }
    }

    async cancelReservation(id,user){
        const reservation = await reservationRepository.findById(id);
        if(!reservation){
            throw new AppError('Reservation introuvable',404);
        }

        if(user.role === 'GESTIONNAIRE' && reservation.storeId._id.toString() !== user.storeId){
            throw new AppError('Vous ne pouvez annuler que reservations de votre magasin',403);
        }

        if(reservation.status === 'ANNULEE'){
            throw new AppError('Cette reservation est deja annulee',400);
        }

        if(['EN_COURS','TERMINEE'].includes(reservation.status)){
            throw new AppError(`Impossible d'annuler une reservation avec le statut ${reservation.status}`,400);
        }

        return await reservationRepository.update(id,{status:'ANNULEE'});
    }
}

module.exports = new ReservationService();