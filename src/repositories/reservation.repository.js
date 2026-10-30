const Reservation = require('../models/reservation.model');

class ReservationRepository{
    async create(reservationData,session =null){
        const reservation = new Reservation(reservationData);

        return await reservation.save({session})
    }

    async findById(id, session = null){
        let query = Reservation.findById(id)
            .populate('borrowerId','name email role')
            .populate('storeId','name site address');

        if(session) query = query.session(session);

        return query;
    }

    async findAll(filter = {}){
        return await Reservation.find(filter).populate('borrowerId','name email').populate('storeId','name site').sort({startDate:-1});
    }

    async findOverdue(storeId, now = new Date()){
        const filter = {
            status: 'EN_COURS',
            endDate: { $lt: now }
        };

        if(storeId) filter.storeId = storeId;

        return Reservation.find(filter)
            .populate('borrowerId','name email')
            .populate('storeId','name site')
            .populate('toolId','reference name status')
            .sort({endDate:1});
    }

    async findActiveByTool(toolId, session = null){
        let query = Reservation.findOne({toolId, status:'EN_COURS'});

        if(session) query = query.session(session);

        return query;
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

    async update(id, updateData, session = null){
        return await Reservation.findByIdAndUpdate(id,updateData,{
            new:true,
            runValidators:true,
            ...(session ? { session } : {})
        });
    }

    async updateIfStatus(id, status, updateData, session = null){
        return await Reservation.findOneAndUpdate(
            {_id:id, status},
            updateData,
            {
                new:true,
                runValidators:true,
                ...(session ? { session } : {})
            }
        );
    }
}

module.exports = new ReservationRepository();