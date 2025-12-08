const pool = require('../db/dbConnection');

module.exports = {
    /**
     * Obtener todas las donaciones
     */
    async getAllDonations() {
        const result = await pool.query('SELECT * FROM donations');
        return result.rows;
    },

    /**
     * Crear una nueva donación (estado inicial: pendiente)
     */
    async createDonation(userId, projectId, amount) {
        try {
            const query = `INSERT INTO donations (user_id, project_id, amount, status, created_at)
                     VALUES ($1, $2, $3, 'pendiente', NOW())
                     RETURNING id, user_id, project_id, amount, status, created_at`;

            const result = await pool.query(query, [userId, projectId, amount]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al crear donación:", error);
            throw error;
        }
    },

    /**
     * Actualizar estado de la donación
     */
    async updateStatus(donationId, status) {
        try {
            const query = `UPDATE donations 
                     SET status = $1
                     WHERE id = $2
                     RETURNING *`;

            const result = await pool.query(query, [status, donationId]);

            if (result.rows.length === 0) {
                throw new Error(`Donación con ID ${donationId} no encontrada`);
            }

            console.log(`✅ Donación ${donationId} actualizada a estado '${status}'`);
            return result.rows[0];
        } catch (error) {
            console.error("Error al actualizar estado de donación:", error);
            throw error;
        }
    },

    /**
     * Obtener una donación por ID
     */
    async getDonationById(id) {
        const result = await pool.query('SELECT * FROM donations WHERE id = $1', [id]);
        return result.rows[0];
    },

    /**
     * Obtener donaciones por usuario
     */
    async getDonationsByUser(userId) {
        const result = await pool.query('SELECT * FROM donations WHERE user_id = $1', [userId]);
        return result.rows;
    },

    /**
     * Obtener donaciones por proyecto
     */
    async getDonationsByProject(projectId) {
        const result = await pool.query('SELECT * FROM donations WHERE project_id = $1', [projectId]);
        return result.rows;
    },

    /**
     * Eliminar una donación
     */
    async deleteDonation(id) {
        const result = await pool.query('DELETE FROM donations WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
};
