// controllers/userController.js
// Controlador para funciones de usuario

const userRepository = require("../repositories/userRepository");

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No autenticado"
      });
    }

    // Devolver los datos del usuario que ya tenemos en el token/request
    // Opcionalmente podríamos consultar la DB para tener datos frescos
    const user = await userRepository.getByIdUser(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener perfil"
    });
  }
};

// Obtener donaciones del usuario
const getUserDonations = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const donations = await userRepository.getUserDonations(userId);

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
};

// Obtener proyectos favoritos del usuario
const getUserFavorites = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const favorites = await userRepository.getUserFavorites(userId);

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
};

// Obtener KPIs del usuario
const getUserKPIs = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario inválido"
      });
    }

    const kpis = await userRepository.getUserKPIs(userId);

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
};

// Bloquear usuario (solo admin)
const blockUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

// Desbloquear usuario (solo admin)
const unblockUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

module.exports = {
  getProfile,
  getUserDonations,
  getUserFavorites,
  getUserKPIs,
  blockUser,
  unblockUser,
};
