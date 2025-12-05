const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// POST /admin/projects/:id/observe - Observar proyecto (solo admin)
router.post("/projects/:id/observe", adminController.observeProject);

// POST /admin/projects/:id/publish - Publicar proyecto (solo admin)
router.post("/projects/:id/publish", adminController.publishProject);

// POST /admin/projects/:id/reject - Rechazar proyecto (solo admin)
router.post("/projects/:id/reject", adminController.rejectProject);

// PATCH /admin/users/:id/block - Bloquear usuario (solo admin)
router.patch("/users/:id/block", adminController.blockUser);

// PATCH /admin/users/:id/unblock - Desbloquear usuario (solo admin)
router.patch("/users/:id/unblock", adminController.unblockUser);

module.exports = router;
