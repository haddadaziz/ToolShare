const express = require('express')
const { getHealth } = require('../../controllers/health.controller')
const { getMe } = require('../../controllers/auth.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const storeRoutes = require('../store.routes');

const authRoutes = require('../auth.routes')

const router = express.Router()

router.get('/health', getHealth)
router.use('/auth', authRoutes)
router.use('/stores',storeRoutes);
router.get('/me', authenticate, getMe)

module.exports = router
