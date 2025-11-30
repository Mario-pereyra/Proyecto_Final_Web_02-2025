const userDonationRepository = require("../repositories/userDonationRepository");

/**
 * Controlador para donaciones de usuario
 */
const userDonationController = {
  /**
   * Obtener donaciones de un usuario
   */
  async getUserDonations(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido"
        });
      }

      const donations = await userDonationRepository.getUserDonations(userId);

      res.json({
        success: true,
        count: donations.length,
        data: donations
      });
    } catch (error) {
      console.error("Error al obtener donaciones del usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener donaciones del usuario"
      });
    }
  }
};

module.exports = userDonationController;
