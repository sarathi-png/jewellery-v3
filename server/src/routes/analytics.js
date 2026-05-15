const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

router.get('/stock-overview', authenticate, analyticsController.getStockOverview);
router.get('/top-sellers', authenticate, analyticsController.getTopSellers);
router.get('/unsold-products', authenticate, analyticsController.getUnsoldProducts);
router.get('/run-analysis', authenticate, analyticsController.getDetailedAnalysis);

module.exports = router;
