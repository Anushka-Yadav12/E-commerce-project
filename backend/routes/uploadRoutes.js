const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Routes
router.post('/', uploadController.upload.single('image'), uploadController.handleUpload);

module.exports = router;
