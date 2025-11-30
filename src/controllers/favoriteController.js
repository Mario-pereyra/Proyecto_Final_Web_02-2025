const favoriteRepository = require("../repositories/favoriteRepository");

/**
 * Controlador para favoritos
 */
exports.addFavorite = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const projectId = parseInt(req.params.projectId);

    if (isNaN(userId) || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos"
      });
    }

    await favoriteRepository.addFavorite(userId, projectId);

    res.json({
      success: true,
      message: "Proyecto agregado a favoritos"
    });
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar favorito"
    });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const projectId = parseInt(req.params.projectId);

    if (isNaN(userId) || isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: "IDs inválidos"
      });
    }

    await favoriteRepository.removeFavorite(userId, projectId);

    res.json({
      success: true,
      message: "Proyecto quitado de favoritos"
    });
  } catch (error) {
    console.error("Error al quitar favorito:", error);
    res.status(500).json({
      success: false,
      message: "Error al quitar favorito"
    });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const favoriteIds = await favoriteRepository.getUserFavoriteIds(userId);

    res.json({
      success: true,
      data: favoriteIds
    });
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener favoritos"
    });
  }
};
