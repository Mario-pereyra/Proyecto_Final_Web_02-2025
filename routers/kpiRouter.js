const express = require("express");
const router = express.Router();
const kpiController = require("../controllers/kpiController");

// GET /kpis - Obtener KPIs de la plataforma
router.get("/kpis", kpiController.getKPIs);

module.exports = router;
