// controllers/userController.js
// Controlador para funciones de usuario

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
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
  blockUser,
  unblockUser,
};
