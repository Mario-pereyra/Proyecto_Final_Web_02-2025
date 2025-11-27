const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// GET /categories - Obtener todas las categorías con conteo de proyectos
router.get("/categories", categoryController.getAllCategories);

// GET /categories/:id/requirements - Obtener requisitos de una categoría
router.get("/categories/:id/requirements", categoryController.getCategoryRequirements);


// POST /admin/categories - Crear nueva categoría (solo admin)
router.post("/admin/categories", categoryController.createCategory);

// POST /admin/categories/:id/requirements - Crear requisito para categoría (solo admin)
router.post(
  "/admin/categories/:id/requirements",
  categoryController.createRequirement
);

// PATCH /admin/requirements/:id - Actualizar requisito (solo admin)
router.patch("/admin/requirements/:id", categoryController.updateRequirement);

module.exports = router;
