const express = require('express')
const { register, login, getAllUsers, deleteAllUsers } = require('../controllers/auth.controller')
const { authenticate, authenticateIfPresent, restrictTo } = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/register' ,authenticate, register)
router.post('/login', login)
router.get('/', authenticate, restrictTo('ADMIN', 'MANAGER'), getAllUsers)
router.delete('/', authenticate, deleteAllUsers)

module.exports = router