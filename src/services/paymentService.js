const donationRepository = require('../repositories/donationRepository');

const GATEWAY_URL = process.env.PAYMENT_GATEWAY_URL || 'http://localhost:3002';

module.exports = {
    /**
     * Crear pago en el Gateway
     */
    async createPayment(userId, projectId, amount) {
        // 1. Crear donación pendiente
        const donation = await donationRepository.createDonation(userId, projectId, amount);

        // 2. Solicitar pago al Gateway
        const response = await fetch(`${GATEWAY_URL}/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                monto: amount,
                metadata: {
                    projectId: projectId,
                    donationId: donation.id,
                    userId: userId
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gateway error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
            donationId: donation.id,
            paymentId: data.id,
            paymentUrl: `${GATEWAY_URL}/payment.html?id=${data.id}`
        };
    },

    /**
     * Procesar webhook del Gateway cuando se confirma un pago
     */
    async processWebhook(webhookData) {
        try {
            console.log('=== WEBHOOK RECIBIDO ===');
            console.log('Datos:', webhookData);

            const { paymentId, estado, metadata } = webhookData;

            if (estado === 'CONFIRMED' && metadata && metadata.donationId) {
                const donationId = metadata.donationId;

                console.log(`Actualizando donación ${donationId} a estado 'pagado'`);

                // Actualizar estado de la donación
                await donationRepository.updateStatus(donationId, 'pagado');

                console.log(`✅ Donación ${donationId} actualizada exitosamente`);
            } else {
                console.log('⚠️ Webhook ignorado: pago no confirmado o sin donationId');
            }

            return { success: true };
        } catch (error) {
            console.error('❌ Error procesando webhook:', error);
            throw error;
        }
    }
};
