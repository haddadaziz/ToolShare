const bcrypt = require('bcryptjs')
const authService = require('../../src/services/auth.service')
const userRepository = require('../../src/repositories/user.repository')

const userId = '507f1f77bcf86cd799439011'

function makeUser(overrides = {}) {
    return {
        _id: { toString: () => userId },
        name: 'Test User',
        email: 'test@example.com',
        password: 'password-hash',
        role: 'USER',
        storeId: null,
        isActive: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides
    }
}

beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-for-auth-service'
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('AuthService', () => {
    test('normalizes registration data, hashes passwords, and ignores protected store assignment', async () => {
        const create = jest.spyOn(userRepository, 'create').mockImplementation(async (data) => makeUser(data))
        jest.spyOn(userRepository, 'countUsers').mockResolvedValue(1)
        jest.spyOn(userRepository, 'findByEmailWithPassword').mockResolvedValue(null)

        const result = await authService.register({
            name: '  Test User ',
            email: ' TEST@EXAMPLE.COM ',
            password: 'password123',
            role: 'USER',
            storeId: '507f1f77bcf86cd799439012'
        })

        expect(create).toHaveBeenCalledTimes(1)
        const savedUser = create.mock.calls[0][0]
        expect(savedUser).toMatchObject({
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER'
        })
        expect(savedUser).not.toHaveProperty('storeId')
        expect(await bcrypt.compare('password123', savedUser.password)).toBe(true)
        expect(result.user).not.toHaveProperty('password')
        expect(result.user.id).toBe(userId)
        expect(result.token).toEqual(expect.any(String))
    })

    test('forces the first registered account to be an admin', async () => {
        const create = jest.spyOn(userRepository, 'create').mockImplementation(async (data) => makeUser(data))
        jest.spyOn(userRepository, 'countUsers').mockResolvedValue(0)
        jest.spyOn(userRepository, 'findByEmailWithPassword').mockResolvedValue(null)

        await authService.register({
            name: 'First User',
            email: 'first@example.com',
            password: 'password123',
            role: 'USER'
        })

        expect(create.mock.calls[0][0].role).toBe('ADMIN')
    })

    test('rejects duplicate emails and invalid credentials', async () => {
        jest.spyOn(userRepository, 'countUsers').mockResolvedValue(1)
        jest.spyOn(userRepository, 'findByEmailWithPassword')
            .mockResolvedValueOnce(makeUser())
            .mockResolvedValueOnce(null)

        await expect(authService.register({
            name: 'Duplicate',
            email: 'test@example.com',
            password: 'password123'
        })).rejects.toMatchObject({ statusCode: 400 })

        await expect(authService.login({
            email: 'missing@example.com',
            password: 'password123'
        })).rejects.toMatchObject({ statusCode: 401 })
    })

    test('rejects inactive users and incorrect passwords on login', async () => {
        jest.spyOn(userRepository, 'findByEmailWithPassword')
            .mockResolvedValueOnce(makeUser({ isActive: false }))
            .mockResolvedValueOnce(makeUser())

        await expect(authService.login({
            email: 'test@example.com',
            password: 'password123'
        })).rejects.toMatchObject({ statusCode: 401, message: 'Your account is inactive.' })

        jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)
        await expect(authService.login({
            email: 'test@example.com',
            password: 'wrong-password'
        })).rejects.toMatchObject({ statusCode: 401, message: 'Invalid credentials.' })
    })
})
