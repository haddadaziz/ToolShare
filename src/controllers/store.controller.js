const storeService = require('../services/store.service');
const AppError = require('../utils/appError');

class StoreController {
    async create(req, res, next) {
        try {
            const { name, address, site } = req.body;

            if (!name || !address || !site) throw new AppError('Tous les champs sont obligatoires', 400);

            const store = await storeService.createStore({ name, address, site });
            res.status(201).json({ status: 'success', message: 'magasin crée avec succes', data: store })
        } catch (e) {
            next(e)
        }
    }

    async getAll(req, res, next) {
        try {
            const filters = {};

            if (req.query.isActive !== undefined) {
                filters.isActive = req.query.isActive === 'true';
            }

            const stores = await storeService.getAllStore(filters);

            res.status(200).json({ status: 'success', count: stores.length, data: stores });
        } catch (e) {
            next(e)
        }
    }

    async getById(req, res, next) {
        try {
            const store = await storeService.getStoreById(req.params.id);
            res.status(200).json({ status: 'success', data: store })
        } catch (e) {
            next(e)
        }
    }

    async update(req, res, next) {
        try {
            const updated = await storeService.updateStore(req.params.id, req.body);

            res.status(200).json({ status: 'success', message: 'magasin mis a jour avec success', data: updated });
        } catch (e) {
            next(e)
        }
    }

    async toggleStatus(req, res, next) {
        try {
            const { isActive } = req.body;

            if (typeof isActive !== 'boolean') throw new AppError('Le champ isActive doit etre un boolean true/false', 400)

            const store = await storeService.toggleStoreStatus(req.params.id, isActive);
            res.status(200).json({ status: 'success', message: ` Magasin ${isActive ? 'activé' : 'desactivé'} avec succès`, data: store })
        }catch(e){
            next(e)
        }
    }
}

module.exports = new StoreController();