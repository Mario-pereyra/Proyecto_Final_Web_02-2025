const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
// const projectSearchController = require('../controllers/projectSearchController'); // Eliminado por refactorización
// const projectDonationController = require('../controllers/projectDonationController'); // Eliminado por refactorización
const fileUploadMiddleware = require('../middleware/fileUploadMiddleware');
// const authMiddleware = require('../middlewares/auth'); // TODO: Descomentar cuando esté implementado

// Configurar multer para recibir imagen principal + documentos
const upload = fileUploadMiddleware.uploadProject.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'documents', maxCount: 10 },
  { name: 'images', maxCount: 10 }
]);

// POST /api/projects - Crear proyecto completo con archivos
// router.post('/', authMiddleware, upload, projectController.createProject);
router.post('/', upload, projectController.createProject); // Temporal sin auth

// POST /api/projects/save - Endpoint unificado crear/editar (RF-PROY-01)
const uploadAny = fileUploadMiddleware.uploadProject.any(); // Acepta archivos dinámicos
router.post('/save', uploadAny, projectController.saveProject);

// POST /api/projects/draft - Guardado incremental de borradores
router.post('/draft', projectController.saveDraft);

// GET /api/projects/search - Buscar proyectos con filtros
router.get('/search', projectController.searchProjects);

// GET /api/projects - Listar proyectos del usuario
// router.get('/', authMiddleware, projectController.getAllProjects);
router.get('/', projectController.getAllProjects); // Temporal sin auth

// GET /api/projects/:id - Obtener proyecto por ID
// router.get('/:id', authMiddleware, projectController.getProjectById);
router.get('/:id', projectController.getProjectById); // Temporal sin auth

// GET /api/projects/:projectId/donations - Obtener donaciones del proyecto
router.get('/:projectId/donations', projectController.getProjectDonations);

// PATCH /api/projects/:id - Actualizar proyecto
// router.patch('/:id', authMiddleware, projectController.updateProject);
router.patch('/:id', projectController.updateProject); // Temporal sin auth

// POST /api/projects/:id/submit - Enviar para revisión
// router.post('/:id/submit', authMiddleware, projectController.submitProject);
router.post('/:id/submit', projectController.submitProject); // Temporal sin auth

// DELETE /api/projects/:id - Soft delete
// router.delete('/:id', authMiddleware, projectController.deleteProject);
router.delete('/:id', projectController.deleteProject); // Temporal sin auth

// POST /api/projects/:id/images - Upload adicional de imágenes
// router.post('/:id/images', authMiddleware, projectController.uploadProjectImages);
router.post('/:id/images', projectController.uploadProjectImages); // Temporal sin auth

// DELETE /api/projects/:id/images/:imageId - Eliminar imagen
// router.delete('/:id/images/:imageId', authMiddleware, projectController.deleteProjectImage);
router.delete('/:id/images/:imageId', projectController.deleteProjectImage); // Temporal sin auth

// PATCH /api/projects/:id/cover - Actualizar portada (RF-REC-01)
const uploadCover = fileUploadMiddleware.uploadProject.single('cover');
router.patch('/:id/cover', uploadCover, projectController.updateProjectCover);

// PATCH /api/projects/:id/requirements/:requirementId/file - Actualizar archivo de requisito (RF-REC-01)
const uploadFile = fileUploadMiddleware.uploadProject.single('file');
router.patch('/:id/requirements/:requirementId/file', uploadFile, projectController.updateRequirementFile);

module.exports = router;
