const express = require('express')
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const {authenticate, restrictTo} = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/',reservationController.create);
router.get('/overdue',restrictTo('MANAGER'),reservationController.getOverdue);
router.get('/',reservationController.getAll);
router.get('/:id',reservationController.getById);
router.patch('/:id/cancel',reservationController.cancel);
router.patch('/:id/checkout',restrictTo('MANAGER'),reservationController.checkOut);
router.patch('/:id/checkin',restrictTo('MANAGER'),reservationController.checkIn);

module.exports = router;
