const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
// const userKpiController = require("../controllers/userKpiController"); // Eliminado por refactorización
// const userDonationController = require("../controllers/userDonationController"); // Eliminado por refactorización
// const userFavoriteController = require("../controllers/userFavoriteController"); // Eliminado por refactorización

// GET /users/:id/kpis - Obtener KPIs del usuario
router.get("/:id/kpis", userController.getUserKPIs);

// GET /users/:id/donations - Obtener donaciones del usuario
router.get("/:id/donations", userController.getUserDonations);

// GET /users/:id/favorites - Obtener proyectos favoritos del usuario
router.get("/:id/favorites", userController.getUserFavorites);

// GET /me - Obtener perfil del usuario autenticado
router.get("/me", userController.getProfile);

module.exports = router;
