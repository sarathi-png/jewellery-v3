const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');

router.get('/', categoryController.getAll);
router.get('/:slug', categoryController.getBySlug);
router.post('/', authenticate, categoryController.create);
router.put('/:id', authenticate, categoryController.update);
router.delete('/:id', authenticate, categoryController.remove);

module.exports = router;
