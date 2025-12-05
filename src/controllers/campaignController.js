const campaignRepository = require("../repositories/campaignRepository");
const projectRepository = require("../repositories/projectRepository");

/**
 * PATCH /api/projects/:id/campaign-state
 * Actualizar estado de la campaña (Iniciar, Pausar, Finalizar)
 */
exports.updateCampaignState = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const projectId = parseInt(req.params.id);
        const { status } = req.body; // 'en_progreso', 'en_pausa', 'finalizada'

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "No autorizado"
            });
        }

        const validStatuses = ['en_progreso', 'en_pausa', 'finalizada'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Estado inválido. Valores permitidos: " + validStatuses.join(", ")
            });
        }

        // Verificar propiedad y estado del proyecto
        // Usamos getById de projectRepository que ya verifica owner_id
        const project = await projectRepository.getById(projectId, userId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Proyecto no encontrado o no eres el dueño"
            });
        }

        // Validar que el proyecto esté publicado antes de iniciar campaña
        if (project.approval_status !== 'publicado') {
            return res.status(400).json({
                success: false,
                message: "No puedes gestionar la campaña de un proyecto no publicado"
            });
        }

        // Actualizar estado
        const updatedProject = await campaignRepository.updateState(projectId, status);

        res.json({
            success: true,
            message: `Campaña actualizada a: ${status}`,
            data: updatedProject
        });

    } catch (error) {
        console.error("Error al actualizar estado de campaña:", error);
        res.status(500).json({
            success: false,
            message: "Error al actualizar la campaña"
        });
    }
};
