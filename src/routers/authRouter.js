const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// POST /auth/register - Registro de usuario
router.post("/register", authController.registerUser);

// POST /auth/login - Login de usuario
router.post("/login", authController.loginUser);

// POST /auth/verify - Verificación de email con código
router.post("/verify", authController.verifyEmail);

// POST /auth/resend-code - Reenviar código de verificación
router.post("/resend-code", authController.resendVerificationCode);

module.exports = router;
