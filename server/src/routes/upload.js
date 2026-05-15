const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, upload.array('images', 10), uploadController.uploadImages);
router.post('/single', authenticate, upload.single('image'), uploadController.uploadSingle);

module.exports = router;
