const router = require('express').Router();
const controller = require('../controllers/whatsappBotController');
const { authenticate } = require('../middleware/auth');

router.get('/status', authenticate, controller.getStatus);
router.post('/start', authenticate, controller.start);
router.post('/disconnect', authenticate, controller.disconnect);
router.post('/clear-auth', authenticate, controller.clearAuth);
router.post('/send', authenticate, controller.sendMessage);

module.exports = router;
