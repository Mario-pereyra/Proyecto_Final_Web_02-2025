const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donationController");

// POST /projects/:id/donations - Crear donación a proyecto
router.post("/projects/:id/donations", donationController.createDonation);

// POST /payments/callback - Callback de pasarela de pago
router.post("/payments/callback", donationController.paymentCallback);

// GET /me/donations - Obtener donaciones del usuario autenticado
router.get("/me/donations", donationController.getUserDonations);

module.exports = router;
