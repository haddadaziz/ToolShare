const userRepository = require('../repositories/user.repository')
const { toPublicUser } = require('../services/auth.service')
const { verifyToken } = require('../utils/jwt.util')
const AppError = require('../utils/appError')

async function authenticate(req, res, next) {
    try {
        const authorization = req.headers.authorization
       if((await userRepository.countUsers()) === 0) return next()
        if (!authorization) {
            return next(new AppError('Authentification requise ou jeton invalide. 1', 401))
        }

        const parts = authorization.split(' ')

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return next(new AppError('Authentification requise ou jeton invalide. 2', 401))
        }

        let payload
        try {
            payload = verifyToken(parts[1])
        } catch {
            return next(new AppError('Authentification requise ou jeton invalide. 3', 401))
        }

        if (!payload || !payload.sub) {
            return next(new AppError('Authentification requise ou jeton invalide. 4', 401))
        }

        const user = await userRepository.findById(payload.sub)
        
        if (!user || !user.isActive) {
            return next(new AppError('Authentification requise ou jeton invalide. 5', 401))
      }
      

        req.user = toPublicUser(user)
        return next()
    } catch (error) {
        return next(error)
    }
}



function restrictTo(...roles) {
    return function (req, res, next) {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError( 'Accès refusé. Permissions insuffisantes.' ,403))
        }
        next()
    }
}



module.exports = {
    authenticate,
    restrictTo,
}
