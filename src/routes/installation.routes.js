const express = require('express');
const installationService = require('../services/installation.service');
const installationController = require('../controllers/installation.controller');

const router = express.Router();

router.get('/status',installationController.getStatus);
router.post('/installation',installationController.install);


module.exports = router;
