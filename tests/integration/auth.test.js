const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-for-auth-integration-tests'

const app = require('../../src/app')
const userRepository = require('../../src/repositories/user.repository')
const { verifyToken } = require('../../src/utils/jwt.util')

const userId = '507f1f77bcf86cd799439011'
const user = {
    _id: { toString: () => userId },
    name: 'Test User',
    email: 'test@example.com',
    password: '',
    role: 'USER',
    storeId: null,
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
}

const originalRepository = {
    create: userRepository.create,
    findByEmailWithPassword: userRepository.findByEmailWithPassword,
    findById: userRepository.findById,
    getAllUsers: userRepository.getAllUsers,
    createFirstAdmin: userRepository.createFirstAdmin,
    deleteAllUsers: userRepository.deleteAllUsers
}

let server
let baseUrl

before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    Object.assign(userRepository, originalRepository)
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })
})

test('registers a user with a bcrypt hash and returns a signed JWT', async () => {
    userRepository.findById = async () => ({ ...user, role: 'ADMIN' })
    userRepository.findByEmailWithPassword = async () => null
    userRepository.create = async (userData) => {
        assert.notEqual(userData.password, 'password123')
        assert.equal(await require('bcryptjs').compare('password123', userData.password), true)
        assert.equal(userData.role, 'USER')
        return { ...user, ...userData, password: undefined }
    }

    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${require('../../src/utils/jwt.util').signToken(userId)}`
        },
        body: JSON.stringify({
            name: ' Test User ',
            email: 'TEST@example.com',
            password: 'password123',
            role: 'USER'
        })
    })

    assert.equal(response.status, 201)
    const body = await response.json()
    assert.equal(body.user.name, 'Test User')
    assert.equal(body.user.email, 'test@example.com')
    assert.equal(body.user.role, 'USER')
    assert.equal(Object.hasOwn(body.user, 'password'), false)
    assert.equal(verifyToken(body.token).sub, userId)
})

test('allows managers to create users but not managers or admins', async () => {
    userRepository.findById = async () => ({ ...user, role: 'MANAGER' })
    userRepository.findByEmailWithPassword = async () => null
    userRepository.create = async (userData) => ({ ...user, ...userData })
    const authorization = `Bearer ${require('../../src/utils/jwt.util').signToken(userId)}`

    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify({
            name: 'New User',
            email: 'new-user@example.com',
            password: 'password123'
        })
    })
    assert.equal(response.status, 201)
    assert.equal((await response.json()).user.role, 'USER')

    for (const role of ['MANAGER', 'ADMIN']) {
        const forbiddenResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', authorization },
            body: JSON.stringify({
                name: 'Forbidden User',
                email: `forbidden-${role.toLowerCase()}@example.com`,
                password: 'password123',
                role
            })
        })
        assert.equal(forbiddenResponse.status, 403)
    }
})

test('allows admins to create managers and denies registration to users', async () => {
    userRepository.findById = async () => ({ ...user, role: 'ADMIN' })
    userRepository.findByEmailWithPassword = async () => null
    userRepository.create = async (userData) => ({ ...user, ...userData })
    userRepository.createFirstAdmin = async () => null
    const authorization = `Bearer ${require('../../src/utils/jwt.util').signToken(userId)}`
    const managerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify({
            name: 'New Manager',
            email: 'new-manager@example.com',
            password: 'password123',
            role: 'MANAGER'
        })
    })
    assert.equal(managerResponse.status, 201)
    assert.equal((await managerResponse.json()).user.role, 'MANAGER')

    const adminAccountResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization },
        body: JSON.stringify({
            name: 'Another Admin',
            email: 'another-admin@example.com',
            password: 'password123',
            role: 'ADMIN'
        })
    })
    assert.equal(adminAccountResponse.status, 403)

    userRepository.findById = async () => ({ ...user, role: 'USER' })
    const userAuthorization = `Bearer ${require('../../src/utils/jwt.util').signToken(userId)}`
    const forbiddenResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: userAuthorization },
        body: JSON.stringify({
            name: 'Forbidden User',
            email: 'forbidden-user@example.com',
            password: 'password123'
        })
    })
    assert.equal(forbiddenResponse.status, 403)

    const unauthenticatedResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            name: 'Anonymous User',
            email: 'anonymous@example.com',
            password: 'password123'
        })
    })
    assert.equal(unauthenticatedResponse.status, 401)
})

test('creates the first account as ADMIN without authentication', async () => {
    userRepository.createFirstAdmin = async (userData) => ({
        ...user,
        ...userData,
        role: 'ADMIN'
    })

    const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            name: 'First Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'USER'
        })
    })

    assert.equal(response.status, 201)
    const body = await response.json()
    assert.equal(body.user.role, 'ADMIN')
    assert.equal(verifyToken(body.token).sub, userId)
    assert.equal(Object.hasOwn(body.user, 'password'), false)

    userRepository.createFirstAdmin = async () => null
    const secondResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            name: 'Second Admin',
            email: 'second-admin@example.com',
            password: 'password123'
        })
    })
    assert.equal(secondResponse.status, 401)
})

test('logs in with a password hash and rejects invalid credentials', async () => {
    const bcrypt = require('bcryptjs')
    userRepository.findByEmailWithPassword = async () => ({
        ...user,
        password: await bcrypt.hash('password123', 4)
    })

    const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'TEST@example.com', password: 'password123' })
    })

    assert.equal(response.status, 200)
    assert.equal(verifyToken((await response.json()).token).sub, userId)

    const invalidResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'TEST@example.com', password: 'wrong-password' })
    })

    assert.equal(invalidResponse.status, 401)
})

test('returns the authenticated profile and rejects missing or invalid tokens', async () => {
    userRepository.findById = async () => user

    const unauthenticated = await fetch(`${baseUrl}/api/v1/me`)
    assert.equal(unauthenticated.status, 401)

    const invalidToken = await fetch(`${baseUrl}/api/v1/me`, {
        headers: { authorization: 'Bearer invalid' }
    })
    assert.equal(invalidToken.status, 401)

    const token = require('../../src/utils/jwt.util').signToken(userId)
    const response = await fetch(`${baseUrl}/api/v1/me`, {
        headers: { authorization: `Bearer ${token}` }
    })

    assert.equal(response.status, 200)
    assert.deepEqual((await response.json()).user, {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: null,
        isActive: true,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    })
})

test('lists public users for managers and admins only', async () => {
    userRepository.getAllUsers = async () => [user]
    userRepository.findById = async () => ({ ...user, role: 'MANAGER' })
    const managerToken = require('../../src/utils/jwt.util').signToken(userId)

    const response = await fetch(`${baseUrl}/api/v1/auth/`, {
        headers: { authorization: `Bearer ${managerToken}` }
    })

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), [{
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        storeId: null,
        isActive: true,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    }])

    const unauthenticatedResponse = await fetch(`${baseUrl}/api/v1/auth/`)
    assert.equal(unauthenticatedResponse.status, 401)

    userRepository.findById = async () => ({ ...user, role: 'USER' })
    const userToken = require('../../src/utils/jwt.util').signToken(userId)
    const forbiddenResponse = await fetch(`${baseUrl}/api/v1/auth/`, {
        headers: { authorization: `Bearer ${userToken}` }
    })
    assert.equal(forbiddenResponse.status, 403)
})

test('deletes all users only for admins', async () => {
    userRepository.deleteAllUsers = async () => ({ deletedCount: 3 })
    userRepository.findById = async () => ({ ...user, role: 'ADMIN' })
    const adminToken = require('../../src/utils/jwt.util').signToken(userId)

    const response = await fetch(`${baseUrl}/api/v1/auth/`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${adminToken}` }
    })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { deletedCount: 3 })

    const unauthenticatedResponse = await fetch(`${baseUrl}/api/v1/auth/`, {
        method: 'DELETE'
    })
    assert.equal(unauthenticatedResponse.status, 401)

    userRepository.findById = async () => ({ ...user, role: 'MANAGER' })
    const managerToken = require('../../src/utils/jwt.util').signToken(userId)
    const forbiddenResponse = await fetch(`${baseUrl}/api/v1/auth/`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${managerToken}` }
    })
    assert.equal(forbiddenResponse.status, 403)
})
