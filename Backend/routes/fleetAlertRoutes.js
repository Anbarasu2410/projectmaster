const express = require('express');
const router = express.Router();
const {
  createFleetAlert
} = require('../controllers/fleetAlertController');

router.post('/', createFleetAlert);

module.exports = router;