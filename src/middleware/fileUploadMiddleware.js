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
 * Formato: UUID-TIMESTAMP-nombre-sanitizado.ext
 * Ejemplo: a7f3c9d2-8b1e-4f5a-9c3d-1701389472-mi-proyecto-portada.jpg
 */
function generateUniqueFilename(originalFilename) {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  const ext = path.extname(originalFilename);
  
  // Sanitizar nombre base (solo alfanuméricos y guiones)
  const baseName = path.basename(originalFilename, ext)
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 30); // Limitar longitud
  
  return `${uuid}-${timestamp}-${baseName}${ext}`;
}

/**
 * Storage para proyectos (imágenes y documentos)
 */
const projectStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;
    
    if (file.fieldname === 'mainImage') {
      uploadPath = 'uploads/images';
    } else if (file.fieldname === 'documents') {
      uploadPath = 'uploads/files';
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
  if (file.fieldname === 'mainImage') {
    // Validar imágenes
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'));
    
  } else if (file.fieldname === 'documents') {
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
