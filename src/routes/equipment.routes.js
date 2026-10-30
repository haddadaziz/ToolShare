const express = require('express')
const equipmentController = require('../controllers/equipment.controller')
const { authenticate, restrictTo } = require('../middlewares/auth.middleware')

const router = express.Router()

router.use(authenticate, restrictTo('ADMIN', 'MANAGER'))

router.get('/', equipmentController.getAll)
router.get('/:id', equipmentController.getById)
router.post('/', equipmentController.create)
router.patch('/:id', equipmentController.update)
router.delete('/:id', equipmentController.disable)
router.patch('/:id/status', equipmentController.setStatus)

module.exports = router
