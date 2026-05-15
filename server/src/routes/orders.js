const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, orderController.getAll);
router.get('/export', authenticate, orderController.exportExcel);
router.get('/:id', authenticate, orderController.getById);
router.post('/', orderController.create);
router.put('/:id/status', authenticate, orderController.updateStatus);
router.delete('/:id', authenticate, orderController.remove);

module.exports = router;
