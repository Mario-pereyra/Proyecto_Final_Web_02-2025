const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

// POST /api/favorites/:userId/:projectId - Agregar a favoritos
router.post("/:userId/:projectId", favoriteController.addFavorite);

// DELETE /api/favorites/:userId/:projectId - Quitar de favoritos
router.delete("/:userId/:projectId", favoriteController.removeFavorite);

// GET /api/favorites/:userId - Obtener IDs de favoritos del usuario
router.get("/:userId", favoriteController.getUserFavorites);

module.exports = router;
