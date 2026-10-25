const storeRepository = require('../repositories/store.repository')
const AppError = require('../utils/appError');

class StoreService{
    async createStore(storeData){
        const existing = await storeRepository.findByName(storeData.name)

        if(existing) throw new AppError('Un magasin avec ce nom exite deja',400);

        return await storeRepository.create(storeData);
    }

    async getAllStore(filters = {}){
        return await storeRepository.findAll(filters);
    }

    async getStoreById(id){
        const store = await storeRepository.findById(id);

        if(!store) throw new AppError('Magasin introuvable',404);
        return store;
    }

    async updateStore(id,updateData){
        const store = await storeRepository.findById(id);

        if(!store) throw new AppError('Magasin introuvable',404);

        if(updateData.name && updateData.name !== store.name){
            const existing = await storeRepository.findByName(updateData.name);

            if(existing && existing._id.toString() !== id.toString()) throw new AppError('Un magasin avec ce nom existe deja',400);
        }

        return await storeRepository.update(id,updateData);
    }

    async toggleStoreStatus(id,isActive){
        const store = await storeRepository.findById(id);

        if(!store) throw new AppError('magasin introubable',404);

        return await storeRepository.update(id,{isActive});
    }
}

module.exports = new StoreService()