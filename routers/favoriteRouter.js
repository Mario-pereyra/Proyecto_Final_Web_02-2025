const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

// POST /projects/:id/favorite - Agregar proyecto a favoritos
router.post("/projects/:id/favorite", favoriteController.addFavorite);

// DELETE /projects/:id/favorite - Eliminar proyecto de favoritos
router.delete("/projects/:id/favorite", favoriteController.removeFavorite);

// GET /me/favorites - Obtener proyectos favoritos del usuario
router.get("/me/favorites", favoriteController.getUserFavorites);

module.exports = router;
