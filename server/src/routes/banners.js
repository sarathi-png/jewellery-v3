const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticate } = require('../middleware/auth');

router.get('/', bannerController.getAll);
router.post('/', authenticate, bannerController.create);
router.put('/:id', authenticate, bannerController.update);
router.delete('/:id', authenticate, bannerController.remove);

module.exports = router;
