const kpiRepository = require("../repositories/kpiRepository");

/**
 * GET /api/kpis - Obtener KPIs de la plataforma
 */
exports.getKPIs = async (req, res) => {
  try {
    const kpis = await kpiRepository.getKPIs();
    return res.status(200).json({
      success: true,
      data: kpis,
    });
  } catch (error) {
    console.error("Error en getKPIs:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los KPIs",
      error: error.message,
    });
  }
};
