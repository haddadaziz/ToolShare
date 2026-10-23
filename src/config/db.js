const mongoose = require('mongoose')

async function connectDB() {
    const mongoUri = process.env.MONGO_URI

    if (!mongoUri) {
        throw new Error('La variable MONGO_URI est obligatoire.')
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
    console.log('Connexion MongoDB établie.')
}

module.exports = connectDB
