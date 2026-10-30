const express = require('express')
const { register, login, getAllUsers, desactive } = require('../controllers/auth.controller')
const { authenticate, authenticateIfPresent, restrictTo } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/register' ,authenticate, register)
router.post('/login', login)
router.put('/desactive/:id',authenticate,restrictTo('ADMIN'), desactive)
router.get('/users', authenticate, restrictTo('ADMIN', 'MANAGER'), getAllUsers)


module.exports = router