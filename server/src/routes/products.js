const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');

router.get('/', productController.getAll);
router.get('/:slug', productController.getBySlug);
router.get('/id/:id', authenticate, productController.getById);
router.post('/', authenticate, productController.create);
router.put('/:id', authenticate, productController.update);
router.delete('/:id', authenticate, productController.remove);

module.exports = router;
