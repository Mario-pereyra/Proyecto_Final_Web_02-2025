const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET /me - Obtener perfil del usuario autenticado
router.get("/me", userController.getProfile);

// PATCH /admin/users/:id/block - Bloquear usuario (solo admin)
router.patch("/admin/users/:id/block", userController.blockUser);

// PATCH /admin/users/:id/unblock - Desbloquear usuario (solo admin)
router.patch("/admin/users/:id/unblock", userController.unblockUser);

module.exports = router;
