const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')

process.env.NODE_ENV = 'test'

const app = require('../../src/app')
let server
let baseUrl

before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })
})

test('serves the root and versioned health endpoints', async () => {
    const rootResponse = await fetch(`${baseUrl}/`)
    assert.equal(rootResponse.status, 200)
    assert.deepEqual(await rootResponse.json(), {
        message: 'API ToolShare prete',
        env: 'test'
    })

    const healthResponse = await fetch(`${baseUrl}/api/v1/health`)
    assert.equal(healthResponse.status, 200)
    assert.deepEqual(await healthResponse.json(), {
        status: 'ok',
        env: 'test'
    })
})

test('serves the OpenAPI specification and Swagger UI', async () => {
    const specificationResponse = await fetch(`${baseUrl}/api-docs.json`)
    assert.equal(specificationResponse.status, 200)
    const specification = await specificationResponse.json()
    assert.equal(specification.openapi, '3.0.3')
    assert.ok(specification.paths['/api/v1/reservations/{id}/checkout'])
    assert.ok(specification.paths['/api/v1/reservations/{id}/checkin'])
    assert.ok(specification.components.securitySchemes.bearerAuth)

    const documentationResponse = await fetch(`${baseUrl}/api-docs/`)
    assert.equal(documentationResponse.status, 200)
    assert.match(documentationResponse.headers.get('content-type'), /text\/html/)
    assert.match(await documentationResponse.text(), /Swagger UI/)
})

test('returns a JSON 404 for unknown routes', async () => {
    const response = await fetch(`${baseUrl}/api/v1/unknown`)

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), {
        message: 'Route not found: GET /api/v1/unknown'
    })
})

test('returns a JSON 400 for malformed request bodies', async () => {
    const response = await fetch(`${baseUrl}/api/v1/health`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{'
    })

    assert.equal(response.status, 400)
    assert.equal(typeof (await response.json()).message, 'string')
})
