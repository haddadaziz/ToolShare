const Store = require('../models/store.model');

class StoreRepostory{
    async create(storeData){
        return await Store.create(storeData);
    }

    async findAll(filter = {}){
        return await Store.find(filter);
    };

    async findById(id){
        return await Store.findById(id);
    };

    async findByName(name){
        return await Store.findOne({name});
    };

    async update(id,updateDate){
        return await Store.findByIdAndUpdate(id,updateDate,{new:true,runValidators:true});
    }
}

module.exports = new StoreRepostory();