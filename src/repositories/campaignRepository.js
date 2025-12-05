const pool = require("../db/dbConnection");

const getConnection = () => {
    return pool;
};

/**
 * Repositorio para gestión de campañas
 */
module.exports = {
    /**
     * Actualizar estado de la campaña
     */
    async updateState(projectId, newState) {
        try {
            const connection = await getConnection();
            const query = `UPDATE projects 
                     SET campaign_status = $1, 
                         updated_at = NOW()
                     WHERE id = $2
                     RETURNING id, title, campaign_status, updated_at`;

            const result = await connection.query(query, [newState, projectId]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al actualizar estado de campaña:", error);
            throw error;
        }
    },

    /**
     * Obtener estado actual de la campaña
     */
    async getState(projectId) {
        try {
            const connection = await getConnection();
            const query = `SELECT id, campaign_status, approval_status FROM projects WHERE id = $1`;
            const result = await connection.query(query, [projectId]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al obtener estado de campaña:", error);
            throw error;
        }
    }
};
