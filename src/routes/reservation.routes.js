const express = require('express')
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const {authenticate} = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/',reservationController.create);
router.get('/',reservationController.getAll);
router.get('/:id',reservationController.getById);
router.patch('/:id/cancel',reservationController.cancel);

module.exports = router;
