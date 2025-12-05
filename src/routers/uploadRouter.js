const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const fileUploadMiddleware = require('../middleware/fileUploadMiddleware');

// POST /api/upload/story-image - Upload de imágenes para Editor.js
const uploadStoryImage = fileUploadMiddleware.uploadProject.single('image');
router.post('/story-image', uploadStoryImage, uploadController.uploadStoryImage);

module.exports = router;
