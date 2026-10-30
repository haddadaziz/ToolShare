const jwt = require('jsonwebtoken')

const TOKEN_LIFETIME = '24h'

function getSecret() {
    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error('The JWT_SECRET environment variable is required.')
    }
    return secret
}

function signToken(userId) {
    return jwt.sign({}, getSecret(), {
        subject: userId,
        expiresIn: TOKEN_LIFETIME,
        algorithm: 'HS256'
    })
}

function verifyToken(token) {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
}

module.exports = { signToken, verifyToken }
