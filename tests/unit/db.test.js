const assert = require('node:assert/strict')
const { test } = require('node:test')
const mongoose = require('mongoose')
const connectDB = require('../../src/config/db')

test('connects to the toolshare database while preserving URI options', async () => {
    const originalMongoUri = process.env.MONGO_URI
    const originalConnect = mongoose.connect
    let connectionUri

    process.env.MONGO_URI = 'mongodb://localhost:27017?replicaSet=rs0'
    mongoose.connect = async (uri) => {
        connectionUri = uri
    }

    try {
        await connectDB()
        assert.equal(connectionUri, 'mongodb://localhost:27017/toolshare?replicaSet=rs0')
    } finally {
        mongoose.connect = originalConnect
        if (originalMongoUri === undefined) {
            delete process.env.MONGO_URI
        } else {
            process.env.MONGO_URI = originalMongoUri
        }
    }
})
