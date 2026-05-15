const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { authenticate } = require('../middleware/auth');

router.get('/', offerController.getAll);
router.post('/', authenticate, offerController.create);
router.put('/:id', authenticate, offerController.update);
router.delete('/:id', authenticate, offerController.remove);

module.exports = router;
