const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, enquiryController.getAll);
router.post('/', enquiryController.create);
router.put('/:id/status', authenticate, enquiryController.updateStatus);
router.delete('/:id', authenticate, enquiryController.remove);

module.exports = router;
