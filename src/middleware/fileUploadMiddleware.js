const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Asegurar que existan los directorios de upload
 */
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Generar nombre único para archivos
 * Formato: UUID.ext (según RF-REC-01)
 * Ejemplo: a7f3c9d2-8b1e-4f5a-9c3d-e1f2a3b4c5d6.jpg
 */
function generateUniqueFilename(originalFilename) {
  const uuid = crypto.randomUUID();
  const ext = path.extname(originalFilename);

  return `${uuid}${ext}`;
}

/**
 * Storage para proyectos (imágenes y documentos)
 */
const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    // RF-REC-01: Segregación de almacenamiento
    if (file.fieldname === 'mainImage' || file.fieldname === 'cover' || file.fieldname === 'images') {
      uploadPath = 'uploads/img'; // Imágenes: portada y contenido
    } else if (file.fieldname === 'documents' || file.fieldname === 'file') {
      uploadPath = 'uploads/files'; // Documentos: requisitos
    } else {
      return cb(new Error('Campo de archivo no reconocido'));
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);

    // Preservar nombre original en el objeto file para uso posterior
    file.originalNameSafe = file.originalname;

    cb(null, uniqueFilename);
  }
});

/**
 * Filtro de tipos de archivos permitidos
 */
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'mainImage' || file.fieldname === 'cover' || file.fieldname === 'images') {
    // Validar imágenes
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'));

  } else if (file.fieldname === 'documents' || file.fieldname === 'file') {
    // Validar documentos
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    }
    return cb(new Error('Solo se permiten documentos (PDF, Word, Excel, PowerPoint)'));
  }

  cb(new Error('Campo de archivo no reconocido'));
};

/**
 * Configuración de multer para proyectos
 */
const uploadProject = multer({
  storage: projectStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB máximo por archivo
    files: 11 // 1 imagen principal + 10 documentos máximo
  }
});

module.exports = {
  uploadProject
};
