const equipmentService = require('../services/equipment.service')
const AppError = require('../utils/appError')

class EquipmentController {
    async create(req, res, next) {
        try {
            const tool = await equipmentService.createTool(req.body, req.user)
            res.status(201).json({ status: 'success', data: tool })
        } catch (error) {
            next(error)
        }
    }

    async getAll(req, res, next) {
        try {
            const includeDisabled = req.query.includeDisabled
            if (includeDisabled !== undefined && includeDisabled !== 'true' && includeDisabled !== 'false') {
                throw new AppError('includeDisabled must be true or false', 400)
            }

            const tools = await equipmentService.getTools(req.user, {
                status: req.query.status,
                storeId: req.query.storeId,
                includeDisabled: includeDisabled === 'true'
            })
            res.status(200).json({ status: 'success', count: tools.length, data: tools })
        } catch (error) {
            next(error)
        }
    }

    async getById(req, res, next) {
        try {
            const includeDisabled = req.query.includeDisabled
            if (includeDisabled !== undefined && includeDisabled !== 'true' && includeDisabled !== 'false') {
                throw new AppError('includeDisabled must be true or false', 400)
            }
            const tool = await equipmentService.getToolById(
                req.params.id,
                req.user,
                { includeDisabled: includeDisabled === 'true' }
            )
            res.status(200).json({ status: 'success', data: tool })
        } catch (error) {
            next(error)
        }
    }

    async update(req, res, next) {
        try {
            const tool = await equipmentService.updateTool(req.params.id, req.body, req.user)
            res.status(200).json({ status: 'success', data: tool })
        } catch (error) {
            next(error)
        }
    }

    async disable(req, res, next) {
        try {
            const tool = await equipmentService.disableTool(req.params.id, req.user)
            res.status(200).json({ status: 'success', data: tool })
        } catch (error) {
            next(error)
        }
    }

    async setStatus(req, res, next) {
        try {
            const tool = await equipmentService.setToolStatus(req.params.id, req.body.status, req.user)
            res.status(200).json({ status: 'success', data: tool })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new EquipmentController()
