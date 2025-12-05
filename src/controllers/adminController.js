const adminRepository = require("../repositories/adminRepository");

// Middleware auxiliar para verificar rol de admin (debería estar en middleware, pero validamos aquí también)
const checkAdmin = (req) => {
  return req.user && req.user.role === 'admin';
};

// Observar proyecto (crear observación)
const observeProject = async (req, res) => {
  try {
    if (!checkAdmin(req)) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }

    const { id } = req.params;
    const { feedback } = req.body;
    const adminId = req.user.id;

    if (!feedback) {
      return res.status(400).json({ success: false, message: "El feedback es obligatorio para observar" });
    }

    const project = await adminRepository.updateProjectStatus(id, 'observado', adminId, feedback);

    if (!project) {
      return res.status(404).json({ success: false, message: "Proyecto no encontrado" });
    }

    res.json({
      success: true,
      message: "Proyecto marcado como observado",
      data: project
    });
  } catch (error) {
    console.error("Error al observar proyecto:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

// Publicar proyecto
const publishProject = async (req, res) => {
  try {
    if (!checkAdmin(req)) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }

    const { id } = req.params;
    const adminId = req.user.id;

    const project = await adminRepository.updateProjectStatus(id, 'publicado', adminId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Proyecto no encontrado" });
    }

    res.json({
      success: true,
      message: "Proyecto publicado exitosamente",
      data: project
    });
  } catch (error) {
    console.error("Error al publicar proyecto:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

// Rechazar proyecto
const rejectProject = async (req, res) => {
  try {
    if (!checkAdmin(req)) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }

    const { id } = req.params;
    const { reason } = req.body; // Motivo del rechazo
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: "El motivo es obligatorio para rechazar" });
    }

    const project = await adminRepository.updateProjectStatus(id, 'rechazado', adminId, reason);

    if (!project) {
      return res.status(404).json({ success: false, message: "Proyecto no encontrado" });
    }

    res.json({
      success: true,
      message: "Proyecto rechazado",
      data: project
    });
  } catch (error) {
    console.error("Error al rechazar proyecto:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

// Bloquear usuario
const blockUser = async (req, res) => {
  try {
    if (!checkAdmin(req)) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }

    const { id } = req.params;

    const user = await adminRepository.updateUserStatus(id, 'bloqueado');

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({
      success: true,
      message: "Usuario bloqueado exitosamente",
      data: user
    });
  } catch (error) {
    console.error("Error al bloquear usuario:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

// Desbloquear usuario
const unblockUser = async (req, res) => {
  try {
    if (!checkAdmin(req)) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }

    const { id } = req.params;

    const user = await adminRepository.updateUserStatus(id, 'activo');

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({
      success: true,
      message: "Usuario desbloqueado exitosamente",
      data: user
    });
  } catch (error) {
    console.error("Error al desbloquear usuario:", error);
    res.status(500).json({ success: false, message: "Error interno" });
  }
};

module.exports = {
  observeProject,
  publishProject,
  rejectProject,
  blockUser,
  unblockUser,
};
