const mongoose = require('mongoose')
const equipmentRepository = require('../../src/repositories/equipment.repository')
const reservationRepository = require('../../src/repositories/reservation.repository')
const reservationService = require('../../src/services/reservation.service')

const storeId = '507f1f77bcf86cd799439011'
const managerId = '507f1f77bcf86cd799439012'
const reservationId = '507f1f77bcf86cd799439013'
const toolId = '507f1f77bcf86cd799439014'
const manager = { id: managerId, role: 'MANAGER', storeId }

function mockTransaction() {
    const session = {
        withTransaction: jest.fn(async (callback) => callback()),
        endSession: jest.fn()
    }
    jest.spyOn(mongoose, 'startSession').mockResolvedValue(session)
    return session
}

function makeReservation(status, overrides = {}) {
    return {
        _id: reservationId,
        toolId,
        storeId: { _id: storeId },
        status,
        ...overrides
    }
}

beforeEach(() => {
    mockTransaction()
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('loan checkout and returns', () => {
    test('checks out a confirmed reservation and marks equipment unavailable', async () => {
        const reservation = makeReservation('CONFIRMEE')
        jest.spyOn(reservationRepository, 'findById').mockResolvedValue(reservation)
        jest.spyOn(reservationRepository, 'findActiveByTool').mockResolvedValue(null)
        const updateEquipment = jest.spyOn(equipmentRepository, 'update').mockResolvedValue({ _id: toolId })
        const updateReservation = jest.spyOn(reservationRepository, 'updateIfStatus')
            .mockImplementation(async (id, status, changes) => ({ ...reservation, ...changes }))

        const result = await reservationService.checkOutReservation(reservationId, manager)

        expect(updateEquipment).toHaveBeenCalledWith(
            toolId,
            { storeId, status: 'DISPONIBLE', isActive: true },
            { status: 'INDISPONIBLE' },
            expect.any(Object)
        )
        expect(updateReservation).toHaveBeenCalledWith(
            reservationId,
            'CONFIRMEE',
            expect.objectContaining({
                status: 'EN_COURS',
                checkedOutByManagerId: managerId,
                actualStartDate: expect.any(Date)
            }),
            expect.any(Object)
        )
        expect(result.status).toBe('EN_COURS')
        const session = await mongoose.startSession.mock.results[0].value
        expect(session.endSession).toHaveBeenCalled()
    })

    test('prevents check-out when equipment is already loaned or unavailable', async () => {
        jest.spyOn(reservationRepository, 'findById').mockResolvedValue(makeReservation('CONFIRMEE'))
        const activeLoanLookup = jest.spyOn(reservationRepository, 'findActiveByTool')
            .mockResolvedValue({ status: 'EN_COURS' })
        const updateEquipment = jest.spyOn(equipmentRepository, 'update')

        await expect(reservationService.checkOutReservation(reservationId, manager))
            .rejects.toMatchObject({ statusCode: 409 })
        expect(activeLoanLookup).toHaveBeenCalledWith(toolId, expect.any(Object))
        expect(updateEquipment).not.toHaveBeenCalled()

        activeLoanLookup.mockResolvedValue(null)
        updateEquipment.mockResolvedValue(null)
        await expect(reservationService.checkOutReservation(reservationId, manager))
            .rejects.toMatchObject({ statusCode: 409 })
    })

    test.each([
        ['BON', 'DISPONIBLE'],
        ['ENDOMMAGE', 'INDISPONIBLE']
    ])('checks in a loan with condition %s and sets equipment to %s', async (condition, toolStatus) => {
        const reservation = makeReservation('EN_COURS')
        jest.spyOn(reservationRepository, 'findById').mockResolvedValue(reservation)
        const updateEquipment = jest.spyOn(equipmentRepository, 'update').mockResolvedValue({ _id: toolId })
        const updateReservation = jest.spyOn(reservationRepository, 'update')
            .mockImplementation(async (id, changes) => ({ ...reservation, ...changes }))

        const result = await reservationService.checkInReservation(reservationId, condition, manager)

        expect(updateEquipment).toHaveBeenCalledWith(
            toolId,
            { storeId },
            { status: toolStatus },
            expect.any(Object)
        )
        expect(updateReservation).toHaveBeenCalledWith(
            reservationId,
            expect.objectContaining({
                status: 'TERMINEE',
                actualEndDate: expect.any(Date),
                checkedInByManagerId: managerId,
                returnCondition: condition
            }),
            expect.any(Object)
        )
        expect(result.status).toBe('TERMINEE')
    })

    test('rejects invalid return conditions, wrong-store managers, and inactive loans', async () => {
        const findById = jest.spyOn(reservationRepository, 'findById')
        const updateEquipment = jest.spyOn(equipmentRepository, 'update')

        await expect(reservationService.checkInReservation(reservationId, 'UNKNOWN', manager))
            .rejects.toMatchObject({ statusCode: 400 })
        expect(findById).not.toHaveBeenCalled()

        findById.mockResolvedValueOnce(makeReservation('EN_COURS', {
            storeId: { _id: '507f1f77bcf86cd799439015' }
        }))
        await expect(reservationService.checkInReservation(reservationId, 'BON', manager))
            .rejects.toMatchObject({ statusCode: 403 })

        findById.mockResolvedValueOnce(makeReservation('CONFIRMEE'))
        await expect(reservationService.checkInReservation(reservationId, 'BON', manager))
            .rejects.toMatchObject({ statusCode: 400 })
        expect(updateEquipment).not.toHaveBeenCalled()
    })

    test('returns overdue reservations only for the manager assigned to a store', async () => {
        const findOverdue = jest.spyOn(reservationRepository, 'findOverdue').mockResolvedValue([])
        const now = new Date('2026-10-30T12:00:00.000Z')

        await reservationService.getOverdueReservations(manager, now)

        expect(findOverdue).toHaveBeenCalledWith(storeId, now)
        await expect(reservationService.getOverdueReservations({ id: managerId, role: 'USER' }, now))
            .rejects.toMatchObject({ statusCode: 403 })
        expect(findOverdue).toHaveBeenCalledTimes(1)
    })
})
