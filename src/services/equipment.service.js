const mongoose = require('mongoose')
const equipmentRepository = require('../repositories/equipment.repository')
const storeRepository = require('../repositories/store.repository')
const AppError = require('../utils/appError')

const TOOL_STATUSES = ['DISPONIBLE', 'INDISPONIBLE', 'HORS_SERVICE']
const TOOL_FIELDS = ['reference', 'name', 'description', 'status']

function assertValidId(id, label) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(`${label} invalide`, 400)
    }
}

function assertObject(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Le corps de la requête doit être un objet', 400)
    }
}

function getStoreScope(user) {
    if (user.role === 'MANAGER') {
        if (!user.storeId) {
            throw new AppError('Aucun magasin n’est affecté à ce gestionnaire', 403)
        }

        return { storeId: user.storeId }
    }

    return {}
}

function pickToolFields(data) {
    return Object.fromEntries(
        Object.entries(data).filter(([field]) => TOOL_FIELDS.includes(field))
    )
}

class EquipmentService {
    async resolveStoreId(user, requestedStoreId) {
        if (user.role === 'MANAGER') {
            const scope = getStoreScope(user)

            if (requestedStoreId && requestedStoreId.toString() !== scope.storeId.toString()) {
                throw new AppError('Accès refusé à ce magasin', 403)
            }

            return scope.storeId
        }

        if (!requestedStoreId) {
            throw new AppError('Le magasin est obligatoire', 400)
        }

        assertValidId(requestedStoreId, 'Identifiant du magasin')
        return requestedStoreId
    }

    async assertStoreExists(storeId) {
        const store = await storeRepository.findById(storeId)

        if (!store) throw new AppError('Magasin introuvable', 404)
        if (!store.isActive) throw new AppError('Impossible de gérer le matériel d’un magasin inactif', 400)
    }

    async createTool(data, user) {
        assertObject(data)
        const { reference, name, description, status } = data

        if (typeof reference !== 'string' || !reference.trim()) {
            throw new AppError('La référence est obligatoire', 400)
        }
        if (typeof name !== 'string' || name.trim().length < 2) {
            throw new AppError('Le nom doit contenir au moins 2 caractères', 400)
        }
        if (description !== undefined && typeof description !== 'string') {
            throw new AppError('La description doit être une chaîne de caractères', 400)
        }
        if (status !== undefined && !TOOL_STATUSES.includes(status)) {
            throw new AppError('Statut du matériel invalide', 400)
        }

        const storeId = await this.resolveStoreId(user, data.storeId)
        await this.assertStoreExists(storeId)

        if (await equipmentRepository.findByReference(reference.trim())) {
            throw new AppError('Cette référence est déjà utilisée', 409)
        }

        try {
            return await equipmentRepository.create({
                reference: reference.trim(),
                name: name.trim(),
                ...(description !== undefined ? { description: description.trim() } : {}),
                ...(status !== undefined ? { status } : {}),
                storeId
            })
        } catch (error) {
            if (error.code === 11000) {
                throw new AppError('Cette référence est déjà utilisée', 409)
            }
            throw error
        }
    }

    async getTools(user, filters = {}) {
        const storeScope = getStoreScope(user)
        const query = filters.includeDisabled ? {} : { isActive: true }

        if (user.role === 'MANAGER') {
            Object.assign(query, storeScope)
        } else if (filters.storeId) {
            assertValidId(filters.storeId, 'Identifiant du magasin')
            query.storeId = filters.storeId
        }

        if (filters.status) {
            if (!TOOL_STATUSES.includes(filters.status)) {
                throw new AppError('Statut du matériel invalide', 400)
            }
            query.status = filters.status
        }

        return equipmentRepository.findAll(query)
    }

    async getToolById(id, user, { includeDisabled = false } = {}) {
        assertValidId(id, 'Identifiant du matériel')
        const filter = { ...getStoreScope(user) }

        if (!includeDisabled) filter.isActive = true

        const tool = await equipmentRepository.findById(id, filter)
        if (!tool) throw new AppError('Matériel introuvable', 404)
        return tool
    }

    async updateTool(id, data, user) {
        assertObject(data)
        assertValidId(id, 'Identifiant du matériel')
        const filter = { ...getStoreScope(user), isActive: true }
        const updates = pickToolFields(data)

        if (data.storeId !== undefined) {
            if (user.role === 'MANAGER') {
                throw new AppError('Un gestionnaire ne peut pas déplacer un matériel vers un autre magasin', 403)
            }
            updates.storeId = await this.resolveStoreId(user, data.storeId)
            await this.assertStoreExists(updates.storeId)
        }
        if (updates.status !== undefined && !TOOL_STATUSES.includes(updates.status)) {
            throw new AppError('Statut du matériel invalide', 400)
        }
        if (updates.reference !== undefined) {
            if (typeof updates.reference !== 'string' || !updates.reference.trim()) {
                throw new AppError('La référence ne peut pas être vide', 400)
            }
            updates.reference = updates.reference.trim()
            if (await equipmentRepository.findByReference(updates.reference, id)) {
                throw new AppError('Cette référence est déjà utilisée', 409)
            }
        }
        if (updates.name !== undefined) {
            if (typeof updates.name !== 'string' || updates.name.trim().length < 2) {
                throw new AppError('Le nom doit contenir au moins 2 caractères', 400)
            }
            updates.name = updates.name.trim()
        }
        if (updates.description !== undefined) {
            if (typeof updates.description !== 'string') {
                throw new AppError('La description doit être une chaîne de caractères', 400)
            }
            updates.description = updates.description.trim()
        }
        if (Object.keys(updates).length === 0) {
            throw new AppError('Aucune donnée valide à mettre à jour', 400)
        }

        let tool
        try {
            tool = await equipmentRepository.update(id, filter, updates)
        } catch (error) {
            if (error.code === 11000) {
                throw new AppError('Cette référence est déjà utilisée', 409)
            }
            throw error
        }
        if (!tool) throw new AppError('Matériel introuvable', 404)
        return tool
    }

    async disableTool(id, user) {
        assertValidId(id, 'Identifiant du matériel')
        const tool = await equipmentRepository.update(
            id,
            { ...getStoreScope(user), isActive: true },
            { isActive: false }
        )
        if (!tool) throw new AppError('Matériel introuvable', 404)
        return tool
    }

    async setToolStatus(id, status, user) {
        assertValidId(id, 'Identifiant du matériel')
        if (!TOOL_STATUSES.includes(status)) {
            throw new AppError('Statut du matériel invalide', 400)
        }

        const tool = await equipmentRepository.update(
            id,
            { ...getStoreScope(user), isActive: true },
            { status }
        )
        if (!tool) throw new AppError('Matériel introuvable', 404)
        return tool
    }
}

module.exports = new EquipmentService()
