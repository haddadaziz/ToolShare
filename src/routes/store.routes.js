const express = require('express')
const router = express.Router();
const storeController = require('../controllers/store.controller');
const {authenticate,restrictTo} = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/',storeController.getAll);
router.get('/:id',storeController.getById)

router.post('/',restrictTo('ADMIN'),storeController.create);
router.put('/:id',restrictTo('ADMIN'),storeController.update);
router.patch('/:id/toggle-status',restrictTo('ADMIN'),storeController.toggleStatus);

module.exports = router
