const Tool = require('../models/tool.model')

class EquipmentRepository {
    async create(toolData) {
        return Tool.create(toolData)
    }

    async findAll(filter = {}) {
        return Tool.find(filter).sort({ createdAt: -1 })
    }

    async findById(id, filter = {}) {
        return Tool.findOne({ _id: id, ...filter })
    }

    async findByReference(reference, excludeId) {
        const filter = { reference }

        if (excludeId) filter._id = { $ne: excludeId }

        return Tool.findOne(filter)
    }

    async update(id, filter, updateData, session = null) {
        return Tool.findOneAndUpdate(
            { _id: id, ...filter },
            updateData,
            { new: true, runValidators: true, ...(session ? { session } : {}) }
        )
    }
}

module.exports = new EquipmentRepository()
