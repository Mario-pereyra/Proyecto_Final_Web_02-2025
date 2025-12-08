const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// TODO: Agregar authMiddleware cuando esté implementado
router.post('/create', paymentController.createPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
