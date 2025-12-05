const donationRepository = require("../repositories/donationRepository");
const projectRepository = require("../repositories/projectRepository");

/**
 * POST /api/projects/:id/donations
 * Crear intención de donación
 */
exports.createDonation = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        const projectId = parseInt(req.params.id);
        const { amount, paymentMethod } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Debes iniciar sesión para donar"
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "El monto debe ser mayor a 0"
            });
        }

        // Verificar que el proyecto existe y acepta donaciones
        const project = await projectRepository.getPublicById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Proyecto no encontrado o no está publicado"
            });
        }

        // Crear donación pendiente
        const donation = await donationRepository.createDonation(userId, projectId, amount, paymentMethod);

        res.status(201).json({
            success: true,
            message: "Donación iniciada",
            data: {
                donationId: donation.id,
                status: donation.status,
                amount: donation.amount,
                // Aquí iría la URL de redirección a la pasarela externa en el futuro
                paymentUrl: `/api/payments/mock-checkout/${donation.id}`
            }
        });

    } catch (error) {
        console.error("Error al crear donación:", error);
        res.status(500).json({
            success: false,
            message: "Error al procesar la donación"
        });
    }
};

/**
 * POST /api/payments/callback
 * Webhook para recibir confirmación de pago (Simulado por ahora)
 */
exports.paymentCallback = async (req, res) => {
    try {
        const { donationId, status, externalId } = req.body;

        if (!donationId || !status) {
            return res.status(400).json({
                success: false,
                message: "Datos incompletos"
            });
        }

        // Actualizar estado
        const updatedDonation = await donationRepository.updateStatus(donationId, status, externalId);

        if (!updatedDonation) {
            return res.status(404).json({
                success: false,
                message: "Donación no encontrada"
            });
        }

        res.json({
            success: true,
            message: "Estado de donación actualizado",
            data: updatedDonation
        });

    } catch (error) {
        console.error("Error en callback de pago:", error);
        res.status(500).json({
            success: false,
            message: "Error interno al procesar el pago"
        });
    }
};

/**
 * GET /api/me/donations
 * Historial de donaciones del usuario
 */
exports.getUserDonations = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "No autorizado"
            });
        }

        const donations = await donationRepository.getByUserId(userId);

        res.json({
            success: true,
            count: donations.length,
            data: donations
        });

    } catch (error) {
        console.error("Error al obtener donaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener historial de donaciones"
        });
    }
};
