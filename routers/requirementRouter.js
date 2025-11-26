const express = require("express");
const router = express.Router();

// GET /requirements - Obtener requisitos por categoría
router.get("/categories/:id/requirements", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
});

module.exports = router;
