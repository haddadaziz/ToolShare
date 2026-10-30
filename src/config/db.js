const mongoose = require('mongoose')

async function connectDB() {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
        throw new Error('The MONGO_URI environment variable is required.')
    }

    const queryIndex = mongoUri.indexOf('?')
    const uriWithoutQuery = queryIndex === -1 ? mongoUri : mongoUri.slice(0, queryIndex)
    const query = queryIndex === -1 ? '' : mongoUri.slice(queryIndex)
    const schemeIndex = uriWithoutQuery.indexOf('://')
    const pathIndex = uriWithoutQuery.indexOf('/', schemeIndex + 3)
    const authority = pathIndex === -1
        ? uriWithoutQuery
        : uriWithoutQuery.slice(0, pathIndex)
    const connectionUri = `${authority}/toolshare${query}`

    await mongoose.connect(connectionUri)
    console.log('MongoDB connection established.')
}

module.exports = connectDB
