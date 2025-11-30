const userFavoriteRepository = require("../repositories/userFavoriteRepository");

/**
 * Controlador para proyectos favoritos de usuario
 */
const userFavoriteController = {
  /**
   * Obtener proyectos favoritos de un usuario
   */
  async getUserFavorites(req, res) {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: "ID de usuario inválido"
        });
      }

      const favorites = await userFavoriteRepository.getUserFavorites(userId);

      res.json({
        success: true,
        count: favorites.length,
        data: favorites
      });
    } catch (error) {
      console.error("Error al obtener favoritos del usuario:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener favoritos del usuario"
      });
    }
  }
};

module.exports = userFavoriteController;
