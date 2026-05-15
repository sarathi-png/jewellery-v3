const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authenticate, adminOnly, authController.register);
router.get('/me', authenticate, authController.getMe);
router.get('/admins', authenticate, adminOnly, authController.getAllAdmins);

module.exports = router;
