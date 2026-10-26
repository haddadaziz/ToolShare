const express = require('express')
const { getRoot } = require('../controllers/root.controller')
const v1Routes = require('./v1')
const installationRoutes = require('../routes/installation.routes');

const router = express.Router()

router.get('/', getRoot)
router.use(installationRoutes);
router.use('/api/v1', v1Routes)

module.exports = router
