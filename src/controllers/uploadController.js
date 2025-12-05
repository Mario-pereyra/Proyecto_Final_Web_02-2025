const { deleteFile } = require('../utils/fileHelper');

/**
 * POST /api/upload/story-image
 * Upload de imágenes para Editor.js (drag & drop en la historia del proyecto)
 * Editor.js espera un formato específico de respuesta
 */
exports.uploadStoryImage = (req, res) => {
    try {
        // Multer ya guardó la imagen en uploads/img/
        if (!req.file) {
            return res.json({
                success: 0,
                message: 'No se recibió ninguna imagen'
            });
        }

        // Editor.js espera exactamente este formato
        return res.json({
            success: 1,
            file: {
                url: `uploads/img/${req.file.filename}` // Ruta relativa para el frontend
            }
        });
    } catch (error) {
        console.error('Error al subir imagen de historia:', error);
        return res.json({
            success: 0,
            message: 'Error al procesar la imagen'
        });
    }
};
