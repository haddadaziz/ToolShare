const reservationService = require('../services/reservation.service');

class ReservationController{
    async create(req,res,next){
        try{
            const reservation = await reservationService.createReservation({
                ...req.body,
                borrowerId:req.user.id
            });

            res.status(201).json({status:'success',message:'Reservation cree avec succes',data:reservation});
        }catch(e){
            next(e)
        }
    }

    async getAll(req,res,next){
        try{
            const filters = {};
            if(req.query.status) filters.status = req.query.status;
            if(req.query.toolId) filters.toolId = req.query.toolId;
            if(req.query.storeId) filters.storeId = req.query.storeId;

            const reservations = await reservationService.getReservations(filters,req.user);

            res.status(200).json({
                status:'success',
                count: reservations.length,
                data:reservations
            });
        }catch(e){
            next(e)
        }
    }

    async getById(req,res,next){
        try{
            const reservation = await reservationService.getReservationById(req.params.id,req.user);

            res.status(200).json({status:'success',data:reservation});
        }catch(e){
            next(e)
        }
    }

    async cancel(req,res,next){
        try{
            const cancelled = await reservationService.cancelReservation(req.params.id,req.user);

            res.status(200).json({status:'success',message:'reservation annulee avec succees',data:cancelled});
        }catch(e){
            next(e)
        }
    }
}

module.exports = new ReservationController();