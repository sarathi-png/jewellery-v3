const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

router.get('/', settingsController.get);
router.put('/', authenticate, settingsController.update);

module.exports = router;
