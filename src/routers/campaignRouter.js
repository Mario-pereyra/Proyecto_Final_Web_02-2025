const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");

// PATCH /projects/:id/campaign-state - Actualizar estado de campaña de proyecto
router.patch(
  "/projects/:id/campaign-state",
  campaignController.updateCampaignState
);

module.exports = router;
