const mongoose = require('mongoose')
const equipmentRepository = require('../repositories/equipment.repository')
const storeRepository = require('../repositories/store.repository')
const AppError = require('../utils/appError')

const TOOL_STATUSES = ['DISPONIBLE', 'INDISPONIBLE', 'HORS_SERVICE']
const TOOL_FIELDS = ['reference', 'name', 'description', 'status']

function assertValidId(id, label) {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(`${label} is invalid`, 400)
    }
}

function assertObject(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('The request body must be an object', 400)
    }
}

function getStoreScope(user) {
    if (user.role === 'MANAGER') {
        if (!user.storeId) {
            throw new AppError('No store is assigned to this manager', 403)
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
                throw new AppError('Access to this store is denied', 403)
            }

            return scope.storeId
        }

        if (!requestedStoreId) {
            throw new AppError('Store is required', 400)
        }

        assertValidId(requestedStoreId, 'Store ID')
        return requestedStoreId
    }

    async assertStoreExists(storeId) {
        const store = await storeRepository.findById(storeId)

        if (!store) throw new AppError('Store not found', 404)
        if (!store.isActive) throw new AppError('Cannot manage equipment for an inactive store', 400)
    }

    async createTool(data, user) {
        assertObject(data)
        const { reference, name, description, status } = data

        if (typeof reference !== 'string' || !reference.trim()) {
            throw new AppError('Reference is required', 400)
        }
        if (typeof name !== 'string' || name.trim().length < 2) {
            throw new AppError('Name must be at least 2 characters long', 400)
        }
        if (description !== undefined && typeof description !== 'string') {
            throw new AppError('Description must be a string', 400)
        }
        if (status !== undefined && !TOOL_STATUSES.includes(status)) {
            throw new AppError('Equipment status is invalid', 400)
        }

        const storeId = await this.resolveStoreId(user, data.storeId)
        await this.assertStoreExists(storeId)

        if (await equipmentRepository.findByReference(reference.trim())) {
            throw new AppError('This reference is already in use', 409)
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
                throw new AppError('This reference is already in use', 409)
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
            assertValidId(filters.storeId, 'Store ID')
            query.storeId = filters.storeId
        }

        if (filters.status) {
            if (!TOOL_STATUSES.includes(filters.status)) {
                throw new AppError('Equipment status is invalid', 400)
            }
            query.status = filters.status
        }

        return equipmentRepository.findAll(query)
    }

    async getToolById(id, user, { includeDisabled = false } = {}) {
        assertValidId(id, 'Equipment ID')
        const filter = { ...getStoreScope(user) }

        if (!includeDisabled) filter.isActive = true

        const tool = await equipmentRepository.findById(id, filter)
        if (!tool) throw new AppError('Equipment not found', 404)
        return tool
    }

    async updateTool(id, data, user) {
        assertObject(data)
        assertValidId(id, 'Equipment ID')
        const filter = { ...getStoreScope(user), isActive: true }
        const updates = pickToolFields(data)

        if (data.storeId !== undefined) {
            if (user.role === 'MANAGER') {
                throw new AppError('A manager cannot move equipment to another store', 403)
            }
            updates.storeId = await this.resolveStoreId(user, data.storeId)
            await this.assertStoreExists(updates.storeId)
        }
        if (updates.status !== undefined && !TOOL_STATUSES.includes(updates.status)) {
            throw new AppError('Equipment status is invalid', 400)
        }
        if (updates.reference !== undefined) {
            if (typeof updates.reference !== 'string' || !updates.reference.trim()) {
                throw new AppError('Reference cannot be empty', 400)
            }
            updates.reference = updates.reference.trim()
            if (await equipmentRepository.findByReference(updates.reference, id)) {
                throw new AppError('This reference is already in use', 409)
            }
        }
        if (updates.name !== undefined) {
            if (typeof updates.name !== 'string' || updates.name.trim().length < 2) {
                throw new AppError('Name must be at least 2 characters long', 400)
            }
            updates.name = updates.name.trim()
        }
        if (updates.description !== undefined) {
            if (typeof updates.description !== 'string') {
                throw new AppError('Description must be a string', 400)
            }
            updates.description = updates.description.trim()
        }
        if (Object.keys(updates).length === 0) {
            throw new AppError('No valid data to update', 400)
        }

        let tool
        try {
            tool = await equipmentRepository.update(id, filter, updates)
        } catch (error) {
            if (error.code === 11000) {
                throw new AppError('This reference is already in use', 409)
            }
            throw error
        }
        if (!tool) throw new AppError('Equipment not found', 404)
        return tool
    }

    async disableTool(id, user) {
        assertValidId(id, 'Equipment ID')
        const tool = await equipmentRepository.update(
            id,
            { ...getStoreScope(user), isActive: true },
            { isActive: false }
        )
        if (!tool) throw new AppError('Equipment not found', 404)
        return tool
    }

    async setToolStatus(id, status, user) {
        assertValidId(id, 'Equipment ID')
        if (!TOOL_STATUSES.includes(status)) {
            throw new AppError('Equipment status is invalid', 400)
        }

        const tool = await equipmentRepository.update(
            id,
            { ...getStoreScope(user), isActive: true },
            { status }
        )
        if (!tool) throw new AppError('Equipment not found', 404)
        return tool
    }
}

module.exports = new EquipmentService()
