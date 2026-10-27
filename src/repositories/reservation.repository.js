const Reservation = require('../models/reservation.model');

class ReservationRepository{
    async create(reservationData,session =null){
        const reservation = new Reservation(reservationData);

        return await reservation.save({session})
    }

    async findById(id){
        return await Reservation.findById(id).populate('borrowerId','name email role').populate('storeId','name site address');
    }

    async findAll(filter = {}){
        return await Reservation.find(filter).populate('borrowerId','name email').populate('storeId','name site').sort({startDate:-1});
    }

    async findConflicting(toolId,startDate,endDate,excludeId = null){
        const query = {
            toolId,
            status: {$in:['CONFIRMEE','EN_COURS']},
            startDate: {$lt:new Date(endDate)},
            endDate: {$gt:new Date(startDate)}
        };

        if(excludeId){
            query._id = {$ne:excludeId};
        }

        return await Reservation.find(query);
    }

    async update(id, updateData){
        return await Reservation.findByIdAndUpdate(id,updateData,{
            new:true,
            runValidators:true
        });
    }
}

module.exports = new ReservationRepository();