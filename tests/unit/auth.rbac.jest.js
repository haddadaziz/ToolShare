const authController = require('../../src/controllers/auth.controller')
const authService = require('../../src/services/auth.service')
const userRepository = require('../../src/repositories/user.repository')
const { restrictTo } = require('../../src/middlewares/auth.middleware')

function makeResponse() {
    const res = {
        status: jest.fn(),
        json: jest.fn()
    }
    res.status.mockReturnValue(res)
    return res
}

async function attemptRegistration(role, requestedRole) {
    const req = {
        user: { role },
        body: { name: 'Created User', email: 'created@example.com', password: 'password123', role: requestedRole }
    }
    const res = makeResponse()
    const next = jest.fn()
    await authController.register(req, res, next)
    return { req, res, next }
}

beforeEach(() => {
    jest.spyOn(userRepository, 'countUsers').mockResolvedValue(1)
    jest.spyOn(authService, 'register').mockResolvedValue({ user: { role: 'USER' } })
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('role-based access and account creation', () => {
    test('allows managers to create users, but rejects manager and admin role assignments', async () => {
        const allowed = await attemptRegistration('MANAGER', 'USER')
        expect(allowed.res.status).toHaveBeenCalledWith(201)
        expect(authService.register).toHaveBeenCalledTimes(1)

        for (const requestedRole of ['MANAGER', 'ADMIN']) {
            const denied = await attemptRegistration('MANAGER', requestedRole)
            expect(denied.next.mock.calls[0][0]).toMatchObject({ statusCode: 403 })
        }
        expect(authService.register).toHaveBeenCalledTimes(1)
    })

    test('allows admins to create managers, but not additional admins', async () => {
        const allowed = await attemptRegistration('ADMIN', 'MANAGER')
        expect(allowed.res.status).toHaveBeenCalledWith(201)

        const denied = await attemptRegistration('ADMIN', 'ADMIN')
        expect(denied.next.mock.calls[0][0]).toMatchObject({ statusCode: 403 })
        expect(authService.register).toHaveBeenCalledTimes(1)
    })

    test('rejects users, unsupported roles, and illegal store assignment', async () => {
        const userDenied = await attemptRegistration('USER', 'USER')
        expect(userDenied.next.mock.calls[0][0]).toMatchObject({ statusCode: 403 })

        const unsupportedRole = await attemptRegistration('ADMIN', 'SUPERADMIN')
        expect(unsupportedRole.next.mock.calls[0][0]).toMatchObject({ statusCode: 400 })

        const manager = await attemptRegistration('MANAGER', 'USER')
        expect(authService.register.mock.calls[0][0]).not.toHaveProperty('storeId')
        expect(manager.req.body).not.toHaveProperty('storeId')
    })

    test('restrictTo allows only the configured roles', () => {
        const next = jest.fn()
        const managerReq = { user: { role: 'MANAGER' } }
        restrictTo('MANAGER')(managerReq, {}, next)
        expect(next).toHaveBeenCalledWith()

        const deniedNext = jest.fn()
        restrictTo('ADMIN')({ user: { role: 'USER' } }, {}, deniedNext)
        expect(deniedNext.mock.calls[0][0]).toMatchObject({ statusCode: 403 })

        const anonymousNext = jest.fn()
        restrictTo('ADMIN')({}, {}, anonymousNext)
        expect(anonymousNext.mock.calls[0][0]).toMatchObject({ statusCode: 403 })
    })
})
