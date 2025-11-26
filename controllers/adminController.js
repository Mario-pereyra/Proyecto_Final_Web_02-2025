// controllers/adminController.js
// Controlador básico para funciones de administrador

// Observar proyecto (crear observación)
const observeProject = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

// Publicar proyecto
const publishProject = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

// Rechazar proyecto
const rejectProject = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

// Bloquear usuario
const blockUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

// Desbloquear usuario
const unblockUser = async (req, res) => {
  res.status(501).json({
    success: false,
    message: "Función no implementada aún",
  });
};

module.exports = {
  observeProject,
  publishProject,
  rejectProject,
  blockUser,
  unblockUser,
};
