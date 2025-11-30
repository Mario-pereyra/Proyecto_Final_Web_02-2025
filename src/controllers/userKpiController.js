const userKpiRepository = require("../repositories/userKpiRepository");

/**
 * Controlador para KPIs de usuario
 */
const userKpiController = {
  /**
   * Obtener KPIs de un usuario
   */
  async getUserKPIs(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido"
        });
      }

      const kpis = await userKpiRepository.getUserKPIs(userId);

      res.json({
        success: true,
        data: kpis
      });
    } catch (error) {
      console.error("Error al obtener KPIs del usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener KPIs del usuario"
      });
    }
  }
};

module.exports = userKpiController;
