const fs = require('fs');
const path = require('path');

/**
 * Elimina un archivo del sistema de archivos de forma segura
 * @param {string} relativePath - Ruta relativa desde la raíz del proyecto (ej: 'uploads/img/uuid.jpg')
 */
const deleteFile = (relativePath) => {
    if (!relativePath) return; // Si no hay ruta, no hace nada

    // Construye la ruta absoluta basada en la raíz del proyecto
    const absolutePath = path.join(__dirname, '../../', relativePath);

    fs.unlink(absolutePath, (err) => {
        if (err) {
            console.error(`Error al borrar archivo físico (${relativePath}):`, err.message);
            // No lanzamos error para no detener el flujo principal, solo logueamos
        } else {
            console.log(`Archivo eliminado correctamente: ${relativePath}`);
        }
    });
};

/**
 * Elimina un archivo de forma síncrona (útil para rollback en transacciones)
 * @param {string} relativePath - Ruta relativa desde la raíz del proyecto
 */
const deleteFileSync = (relativePath) => {
    if (!relativePath) return;

    const absolutePath = path.join(__dirname, '../../', relativePath);

    try {
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            console.log(`Archivo eliminado correctamente (sync): ${relativePath}`);
        }
    } catch (err) {
        console.error(`Error al borrar archivo físico (sync) (${relativePath}):`, err.message);
    }
};

module.exports = { deleteFile, deleteFileSync };
