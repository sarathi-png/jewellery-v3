const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { authenticate } = require('../middleware/auth');

router.get('/', testimonialController.getAll);
router.get('/all', authenticate, testimonialController.getAllAdmin);
router.post('/', authenticate, testimonialController.create);
router.post('/public', testimonialController.createPublic);
router.put('/:id', authenticate, testimonialController.update);
router.delete('/:id', authenticate, testimonialController.remove);

module.exports = router;
