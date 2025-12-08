const paymentService = require('../services/paymentService');

exports.createPayment = async (req, res) => {
    try {
        console.log('=== CREATE PAYMENT REQUEST ===');
        console.log('Body:', req.body);
        console.log('Headers:', req.headers);

        const { projectId, amount, userId } = req.body;

        console.log('Parsed values:', { projectId, amount, userId });

        // Validaciones
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'projectId es requerido'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'amount debe ser mayor a 0'
            });
        }

        // TODO: Cuando se implemente authMiddleware, usar req.user.id
        const userIdFinal = userId || (req.user ? req.user.id : null);

        if (!userIdFinal) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        console.log('Calling paymentService.createPayment...');
        const result = await paymentService.createPayment(userIdFinal, projectId, amount);
        console.log('Payment service result:', result);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('=== ERROR CREATING PAYMENT ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al crear el pago',
            error: error.message
        });
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        console.log('=== WEBHOOK RECEIVED ===');
        console.log('Body:', req.body);

        await paymentService.processWebhook(req.body);
        res.json({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ success: false });
    }
};
