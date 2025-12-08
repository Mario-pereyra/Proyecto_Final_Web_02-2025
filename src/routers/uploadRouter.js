const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const fileUploadMiddleware = require('../middleware/fileUploadMiddleware');

// POST /api/upload/story-image - Upload de imágenes para Editor.js
const uploadStoryImage = fileUploadMiddleware.uploadProject.single('image');

router.post('/story-image', uploadStoryImage, uploadController.uploadStoryImage);

// POST /api/upload/cover - Upload de portada de proyecto
const uploadCover = fileUploadMiddleware.uploadProject.single('cover');
router.post('/cover', uploadCover, uploadController.uploadCover);

// POST /api/upload - Upload genérico de archivos
const uploadFile = fileUploadMiddleware.uploadProject.single('file');
router.post('/', uploadFile, uploadController.uploadFile);

module.exports = router;
