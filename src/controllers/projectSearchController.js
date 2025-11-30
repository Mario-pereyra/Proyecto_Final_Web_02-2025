const projectSearchRepository = require("../repositories/projectSearchRepository");

/**
 * Controlador para búsqueda de proyectos
 */
const projectSearchController = {
  /**
   * Buscar proyectos con filtros
   */
  async searchProjects(req, res) {
    try {
      const {
        search,
        category,
        orderBy,
        minGoal,
        maxGoal,
        minProgress,
        maxProgress
      } = req.query;

      const filters = {
        search,
        category,
        orderBy,
        minGoal: minGoal ? parseFloat(minGoal) : 0,
        maxGoal: maxGoal ? parseFloat(maxGoal) : null,
        minProgress: minProgress ? parseFloat(minProgress) : 0,
        maxProgress: maxProgress ? parseFloat(maxProgress) : 100
      };

      const projects = await projectSearchRepository.searchProjects(filters);

      res.json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      console.error("Error al buscar proyectos:", error);
      res.status(500).json({
        success: false,
        message: "Error al buscar proyectos"
      });
    }
  }
};

module.exports = projectSearchController;
