const storeRepository = require('../repositories/store.repository')
const AppError = require('../utils/appError');
const userRepository = require('../repositories/user.repository');

class StoreService{
    async createStore(storeData){
        const existing = await storeRepository.findByName(storeData.name)

        if(existing) throw new AppError('A store with this name already exists',400);

        return await storeRepository.create(storeData);
    }

    async getAllStore(filters = {}){
        return await storeRepository.findAll(filters);
    }

    async getStoreById(id){
        const store = await storeRepository.findById(id);

        if(!store) throw new AppError('Store not found',404);
        return store;
    }

    async updateStore(id,updateData){
        const store = await storeRepository.findById(id);

        if(!store) throw new AppError('Store not found',404);

        if(updateData.name && updateData.name !== store.name){
            const existing = await storeRepository.findByName(updateData.name);

            if(existing && existing._id.toString() !== id.toString()) throw new AppError('A store with this name already exists',400);
        }

        return await storeRepository.update(id,updateData);
    }

    async toggleStoreStatus(id,isActive){
        const store = await storeRepository.findById(id);

        if(!store) throw new AppError('Store not found',404);

        return await storeRepository.update(id,{isActive});
    }

    async assignManager(storeId,managerId){
        const store = await storeRepository.findById(storeId);

        if(!store) throw new AppError('Store not found',404);

        if(!store.isActive) throw new AppError('Cannot assign a manager to an inactive store',400);

        const manager = await userRepository.findById(managerId);

        if(!manager) throw new AppError('Manager not found',404);

        if(!manager.isActive) throw new AppError('This manager is inactive',400);

        if(manager.role !== 'MANAGER') throw new AppError('The user must have the manager role to be assigned',400);

        if(manager.storeId && manager.storeId.toString() !== storeId.toString()) {
            throw new AppError('This manager is already assigned to another store',400);
        }

        const updatedManager = await userRepository.update(managerId,{storeId});

        return {
            store,
            manager:{
                id:updatedManager._id,
                name:updatedManager.name,
                email:updatedManager.email,
                role:updatedManager.role,
                storeId: updatedManager.storeId
            }
        }
    }
}

module.exports = new StoreService()