const assert = require('node:assert/strict')
const { test } = require('node:test')
const mongoose = require('mongoose')
const Tool = require('../../src/models/tool.model')
const Reservation = require('../../src/models/reservation.model')
const equipmentRepository = require('../../src/repositories/equipment.repository')
const reservationRepository = require('../../src/repositories/reservation.repository')
const reservationService = require('../../src/services/reservation.service')

const storeId = '507f1f77bcf86cd799439011'
const managerId = '507f1f77bcf86cd799439012'
const reservationId = '507f1f77bcf86cd799439013'
const toolId = '507f1f77bcf86cd799439014'

test('reservation tool references resolve to the Tool model', () => {
    assert.equal(Reservation.schema.path('toolId').options.ref, Tool.modelName)
})

test('manager check-out starts a confirmed reservation and marks equipment unavailable', async () => {
    const previous = {
        startSession: mongoose.startSession,
        findById: reservationRepository.findById,
        findActiveByTool: reservationRepository.findActiveByTool,
        updateIfStatus: reservationRepository.updateIfStatus,
        updateEquipment: equipmentRepository.update
    }
    const reservation = {
        _id: reservationId,
        toolId,
        storeId: { _id: storeId },
        status: 'CONFIRMEE'
    }
    let activeToolLookup
    let equipmentUpdate
    let reservationUpdate
    let transactionEnded = false
    mongoose.startSession = async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => { transactionEnded = true }
    })
    reservationRepository.findById = async (id, session) => {
        assert.equal(id, reservationId)
        assert.ok(session)
        return reservation
    }
    reservationRepository.findActiveByTool = async (...args) => {
        activeToolLookup = args
        return null
    }
    equipmentRepository.update = async (...args) => {
        equipmentUpdate = args
        return { _id: toolId }
    }
    reservationRepository.updateIfStatus = async (...args) => {
        reservationUpdate = args
        return { ...reservation, ...args[2] }
    }

    try {
        const result = await reservationService.checkOutReservation(
            reservationId,
            { id: managerId, role: 'MANAGER', storeId }
        )

        assert.equal(activeToolLookup[0], toolId)
        assert.ok(activeToolLookup[1])
        assert.deepEqual(equipmentUpdate.slice(0, 3), [
            toolId,
            { storeId, status: 'DISPONIBLE', isActive: true },
            { status: 'INDISPONIBLE' }
        ])
        assert.ok(equipmentUpdate[3])
        assert.equal(reservationUpdate[0], reservationId)
        assert.equal(reservationUpdate[1], 'CONFIRMEE')
        assert.deepEqual(
            {
                status: reservationUpdate[2].status,
                checkedOutByManagerId: reservationUpdate[2].checkedOutByManagerId
            },
            { status: 'EN_COURS', checkedOutByManagerId: managerId }
        )
        assert.ok(reservationUpdate[2].actualStartDate instanceof Date)
        assert.equal(result.status, 'EN_COURS')
        assert.equal(transactionEnded, true)
    } finally {
        mongoose.startSession = previous.startSession
        reservationRepository.findById = previous.findById
        reservationRepository.findActiveByTool = previous.findActiveByTool
        reservationRepository.updateIfStatus = previous.updateIfStatus
        equipmentRepository.update = previous.updateEquipment
    }
})

test('check-out prevents handing out equipment that already has an active reservation', async () => {
    const previous = {
        startSession: mongoose.startSession,
        findById: reservationRepository.findById,
        findActiveByTool: reservationRepository.findActiveByTool,
        updateEquipment: equipmentRepository.update
    }
    let equipmentUpdates = 0
    mongoose.startSession = async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => {}
    })
    reservationRepository.findById = async () => ({
        toolId,
        storeId: { _id: storeId },
        status: 'CONFIRMEE'
    })
    reservationRepository.findActiveByTool = async () => ({ status: 'EN_COURS' })
    equipmentRepository.update = async () => {
        equipmentUpdates += 1
        return { _id: toolId }
    }

    try {
        await assert.rejects(
            reservationService.checkOutReservation(
                reservationId,
                { id: managerId, role: 'MANAGER', storeId }
            ),
            { statusCode: 409 }
        )
        assert.equal(equipmentUpdates, 0)
    } finally {
        mongoose.startSession = previous.startSession
        reservationRepository.findById = previous.findById
        reservationRepository.findActiveByTool = previous.findActiveByTool
        equipmentRepository.update = previous.updateEquipment
    }
})

test('check-out rejects reservations outside the manager store and unavailable equipment', async () => {
    const previous = {
        startSession: mongoose.startSession,
        findById: reservationRepository.findById,
        findActiveByTool: reservationRepository.findActiveByTool,
        updateEquipment: equipmentRepository.update
    }
    let equipmentUpdates = 0
    mongoose.startSession = async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => {}
    })
    reservationRepository.findById = async () => ({
        toolId,
        storeId: { _id: '507f1f77bcf86cd799439015' },
        status: 'CONFIRMEE'
    })
    reservationRepository.findActiveByTool = async () => null
    equipmentRepository.update = async () => {
        equipmentUpdates += 1
        return null
    }

    try {
        await assert.rejects(
            reservationService.checkOutReservation(
                reservationId,
                { id: managerId, role: 'MANAGER', storeId }
            ),
            { statusCode: 403 }
        )
        reservationRepository.findById = async () => ({
            toolId,
            storeId: { _id: storeId },
            status: 'CONFIRMEE'
        })
        await assert.rejects(
            reservationService.checkOutReservation(
                reservationId,
                { id: managerId, role: 'MANAGER', storeId }
            ),
            { statusCode: 409 }
        )
        assert.equal(equipmentUpdates, 1)
    } finally {
        mongoose.startSession = previous.startSession
        reservationRepository.findById = previous.findById
        reservationRepository.findActiveByTool = previous.findActiveByTool
        equipmentRepository.update = previous.updateEquipment
    }
})

test('manager check-in completes the reservation and marks damaged equipment unavailable', async () => {
    const previous = {
        startSession: mongoose.startSession,
        findById: reservationRepository.findById,
        updateReservation: reservationRepository.update,
        updateEquipment: equipmentRepository.update
    }
    const reservation = {
        _id: reservationId,
        toolId,
        storeId: { _id: storeId },
        status: 'EN_COURS'
    }
    let equipmentUpdate
    let reservationUpdate
    let transactionEnded = false
    mongoose.startSession = async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => { transactionEnded = true }
    })
    reservationRepository.findById = async (id, session) => {
        assert.equal(id, reservationId)
        assert.ok(session)
        return reservation
    }
    equipmentRepository.update = async (...args) => {
        equipmentUpdate = args
        return { _id: toolId }
    }
    reservationRepository.update = async (...args) => {
        reservationUpdate = args
        return { ...reservation, ...args[1] }
    }

    try {
        const result = await reservationService.checkInReservation(
            reservationId,
            'ENDOMMAGE',
            { id: managerId, role: 'MANAGER', storeId }
        )

        assert.deepEqual(equipmentUpdate.slice(0, 3), [
            toolId,
            { storeId },
            { status: 'INDISPONIBLE' }
        ])
        assert.ok(equipmentUpdate[3])
        assert.equal(reservationUpdate[0], reservationId)
        assert.deepEqual(
            {
                status: reservationUpdate[1].status,
                checkedInByManagerId: reservationUpdate[1].checkedInByManagerId,
                returnCondition: reservationUpdate[1].returnCondition
            },
            {
                status: 'TERMINEE',
                checkedInByManagerId: managerId,
                returnCondition: 'ENDOMMAGE'
            }
        )
        assert.ok(reservationUpdate[1].actualEndDate instanceof Date)
        assert.equal(result.status, 'TERMINEE')
        assert.equal(transactionEnded, true)
    } finally {
        mongoose.startSession = previous.startSession
        reservationRepository.findById = previous.findById
        reservationRepository.update = previous.updateReservation
        equipmentRepository.update = previous.updateEquipment
    }
})

test('a good return makes the equipment available', async () => {
    const previous = {
        startSession: mongoose.startSession,
        findById: reservationRepository.findById,
        updateReservation: reservationRepository.update,
        updateEquipment: equipmentRepository.update
    }
    let equipmentUpdates = []
    mongoose.startSession = async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => {}
    })
    reservationRepository.findById = async () => ({
        toolId,
        storeId: { _id: storeId },
        status: 'EN_COURS'
    })
    equipmentRepository.update = async (...args) => {
        equipmentUpdates = args
        return { _id: toolId }
    }
    reservationRepository.update = async (id, updates) => updates

    try {
        await reservationService.checkInReservation(
            reservationId,
            'BON',
            { id: managerId, role: 'MANAGER', storeId }
        )
        assert.deepEqual(equipmentUpdates[2], { status: 'DISPONIBLE' })
    } finally {
        mongoose.startSession = previous.startSession
        reservationRepository.findById = previous.findById
        reservationRepository.update = previous.updateReservation
        equipmentRepository.update = previous.updateEquipment
    }
})

test('authorized managers receive reservations from their store', async () => {
    const previous = reservationRepository.findById
    const reservation = { storeId: { _id: storeId } }
    reservationRepository.findById = async () => reservation

    try {
        const result = await reservationService.getReservationById(reservationId, {
            id: managerId,
            role: 'MANAGER',
            storeId
        })
        assert.equal(result, reservation)

        await assert.rejects(
            reservationService.getReservationById(reservationId, {
                id: managerId,
                role: 'MANAGER',
                storeId: '507f1f77bcf86cd799439015'
            }),
            { statusCode: 403 }
        )
    } finally {
        reservationRepository.findById = previous
    }
})

test('check-in rejects invalid conditions, other-store reservations, and non-active loans', async () => {
    const previous = {
        startSession: mongoose.startSession,
        findById: reservationRepository.findById,
        updateReservation: reservationRepository.update,
        updateEquipment: equipmentRepository.update
    }
    let equipmentUpdates = 0
    mongoose.startSession = async () => ({
        withTransaction: async (callback) => callback(),
        endSession: async () => {}
    })
    reservationRepository.findById = async () => ({
        toolId,
        storeId: { _id: '507f1f77bcf86cd799439015' },
        status: 'EN_COURS'
    })
    equipmentRepository.update = async () => {
        equipmentUpdates += 1
        return { _id: toolId }
    }
    reservationRepository.update = async (id, updates) => updates

    try {
        await assert.rejects(
            reservationService.checkInReservation(reservationId, 'INCONNU', {
                id: managerId, role: 'MANAGER', storeId
            }),
            { statusCode: 400 }
        )
        await assert.rejects(
            reservationService.checkInReservation(reservationId, 'BON', {
                id: managerId, role: 'MANAGER', storeId
            }),
            { statusCode: 403 }
        )
        assert.equal(equipmentUpdates, 0)
    } finally {
        mongoose.startSession = previous.startSession
        reservationRepository.findById = previous.findById
        reservationRepository.update = previous.updateReservation
        equipmentRepository.update = previous.updateEquipment
    }
})

test('overdue reservations are limited to the manager store and current loans', async () => {
    const previous = reservationRepository.findOverdue
    let args
    reservationRepository.findOverdue = async (...queryArgs) => {
        args = queryArgs
        return []
    }

    try {
        const now = new Date('2026-10-30T12:00:00.000Z')
        await reservationService.getOverdueReservations(
            { role: 'MANAGER', storeId },
            now
        )
        assert.deepEqual(args, [storeId, now])
        await assert.rejects(
            reservationService.getOverdueReservations({ role: 'USER', id: managerId }),
            { statusCode: 403 }
        )
    } finally {
        reservationRepository.findOverdue = previous
    }
})
