const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

// POST /projects - Crear nuevo proyecto
router.post("/", projectController.createProject);

// GET /projects - Obtener todos los proyectos (con filtros)
router.get("/", projectController.getAllProjects);

// GET /projects/:id - Obtener proyecto por ID
router.get("/:id", projectController.getProjectById);

// PATCH /projects/:id - Actualizar proyecto
router.patch("/:id", projectController.updateProject);

// POST /projects/:id/submit - Enviar proyecto para revisión
router.post("/:id/submit", projectController.submitProject);

// POST /projects/:id/images - Subir imágenes de proyecto
router.post("/:id/images", projectController.uploadProjectImages);

// DELETE /projects/:id/images/:imageId - Eliminar imagen de proyecto
router.delete("/:id/images/:imageId", projectController.deleteProjectImage);

module.exports = router;
