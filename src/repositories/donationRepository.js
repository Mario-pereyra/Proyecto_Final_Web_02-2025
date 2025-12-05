const pool = require("../db/dbConnection");

const getConnection = () => {
    return pool;
};

/**
 * Repositorio para gestionar donaciones
 */
module.exports = {
    /**
     * Crear una nueva donación (estado inicial: pendiente)
     */
    async createDonation(userId, projectId, amount, paymentMethod = 'external') {
        try {
            const connection = await getConnection();
            const query = `INSERT INTO donations (user_id, project_id, amount, status, payment_method, created_at)
                     VALUES ($1, $2, $3, 'pendiente', $4, NOW())
                     RETURNING id, user_id, project_id, amount, status, created_at`;

            const result = await connection.query(query, [userId, projectId, amount, paymentMethod]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al crear donación:", error);
            throw error;
        }
    },

    /**
     * Actualizar estado de la donación
     */
    async updateStatus(donationId, status, externalId = null) {
        try {
            const connection = await getConnection();
            const query = `UPDATE donations 
                     SET status = $1, 
                         external_transaction_id = COALESCE($2, external_transaction_id),
                         updated_at = NOW()
                     WHERE id = $3
                     RETURNING id, status, updated_at`;

            const result = await connection.query(query, [status, externalId, donationId]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al actualizar estado de donación:", error);
            throw error;
        }
    },

    /**
     * Obtener donación por ID
     */
    async getById(donationId) {
        try {
            const connection = await getConnection();
            const query = `SELECT * FROM donations WHERE id = $1`;
            const result = await connection.query(query, [donationId]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al obtener donación:", error);
            throw error;
        }
    },

    /**
     * Obtener historial de donaciones de un usuario
     */
    async getByUserId(userId) {
        try {
            const connection = await getConnection();
            const query = `SELECT 
                       d.id,
                       d.amount,
                       d.status,
                       d.created_at,
                       p.title as project_title,
                       p.id as project_id
                     FROM donations d
                     JOIN projects p ON d.project_id = p.id
                     WHERE d.user_id = $1
                     ORDER BY d.created_at DESC`;

            const result = await connection.query(query, [userId]);
            return result.rows;
        } catch (error) {
            console.error("Error al obtener donaciones del usuario:", error);
            throw error;
        }
    }
};
