const assert = require('node:assert/strict')
const { test } = require('node:test')
const Tool = require('../../src/models/tool.model')
const equipmentRepository = require('../../src/repositories/equipment.repository')
const storeRepository = require('../../src/repositories/store.repository')
const equipmentService = require('../../src/services/equipment.service')

test('Tool schema requires unique references and a store with supported statuses', () => {
    const schema = Tool.schema

    assert.equal(schema.path('reference').options.unique, true)
    assert.equal(schema.path('storeId').options.required, true)
    assert.equal(schema.path('storeId').options.ref, 'Store')
    assert.deepEqual(schema.path('status').enumValues, [
        'DISPONIBLE',
        'INDISPONIBLE',
        'HORS_SERVICE'
    ])
    assert.equal(schema.path('status').defaultValue, 'DISPONIBLE')
    assert.equal(schema.path('isActive').defaultValue, true)
})

test('manager tool operations stay scoped to the assigned store', async () => {
    const previous = {
        findById: equipmentRepository.findById,
        findAll: equipmentRepository.findAll,
        create: equipmentRepository.create,
        findByReference: equipmentRepository.findByReference,
        update: equipmentRepository.update,
        findStoreById: storeRepository.findById
    }
    const storeId = '507f1f77bcf86cd799439011'
    let capturedFilter
    let capturedCreate

    storeRepository.findById = async () => ({ _id: storeId, isActive: true })
    equipmentRepository.findByReference = async () => null
    equipmentRepository.create = async (data) => {
        capturedCreate = data
        return data
    }
    equipmentRepository.findAll = async (filter) => {
        capturedFilter = filter
        return []
    }
    equipmentRepository.findById = async (id, filter) => {
        capturedFilter = filter
        return null
    }

    try {
        await equipmentService.getTools({ role: 'MANAGER', storeId })
        assert.deepEqual(capturedFilter, { isActive: true, storeId })

        await equipmentService.createTool({
            reference: 'TOOL-1',
            name: 'Perceuse',
            description: 'Perceuse sans fil',
        }, { role: 'MANAGER', storeId })
        assert.equal(capturedCreate.storeId, storeId)
        assert.equal(capturedCreate.status, undefined)

        await assert.rejects(
            equipmentService.getToolById('507f1f77bcf86cd799439012', {
                role: 'MANAGER',
                storeId
            }),
            { message: 'Equipment not found' }
        )
        assert.deepEqual(capturedFilter, { storeId, isActive: true })

        await assert.rejects(
            equipmentService.createTool({
                reference: 'TOOL-2',
                name: 'Perceuse',
                storeId: '507f1f77bcf86cd799439012'
            }, { role: 'MANAGER', storeId }),
            { message: 'Access to this store is denied' }
        )

        equipmentRepository.update = async (id, filter, updates) => {
            capturedFilter = filter
            capturedCreate = updates
            return updates
        }
        await equipmentService.setToolStatus(
            '507f1f77bcf86cd799439012',
            'HORS_SERVICE',
            { role: 'MANAGER', storeId }
        )
        assert.deepEqual(capturedFilter, { storeId, isActive: true })
        assert.deepEqual(capturedCreate, { status: 'HORS_SERVICE' })

        await equipmentService.disableTool(
            '507f1f77bcf86cd799439012',
            { role: 'MANAGER', storeId }
        )
        assert.deepEqual(capturedFilter, { storeId, isActive: true })
        assert.deepEqual(capturedCreate, { isActive: false })
    } finally {
        equipmentRepository.findById = previous.findById
        equipmentRepository.findAll = previous.findAll
        equipmentRepository.create = previous.create
        equipmentRepository.findByReference = previous.findByReference
        equipmentRepository.update = previous.update
        storeRepository.findById = previous.findStoreById
    }
})
