const pool = require("../db/dbConnection");

const getConnection = () => {
    return pool;
};

/**
 * Repositorio para operaciones de administrador
 */
module.exports = {
    
    async updateProjectStatus(projectId, status, adminId, feedback = null) {
        try {
            const connection = await getConnection();

            // Iniciar transacción
            await connection.query('BEGIN');

            // 1. Actualizar estado del proyecto
            const updateQuery = `UPDATE projects 
                           SET approval_status = $1, 
                               updated_at = NOW()
                           WHERE id = $2
                           RETURNING id, title, approval_status, owner_id`;

            const projectResult = await connection.query(updateQuery, [status, projectId]);
            const project = projectResult.rows[0];

            if (!project) {
                await connection.query('ROLLBACK');
                return null;
            }

            // 2. Registrar la acción en el historial (si existiera una tabla de historial, por ahora solo logueamos o guardamos feedback si es necesario)
            // Si el estado es 'observado' o 'rechazado', podríamos querer guardar el feedback en una tabla separada o en el mismo proyecto si hubiera columna.
            // Asumiremos por ahora que no hay tabla de historial compleja y solo actualizamos el estado.
            // Si hubiera feedback, lo ideal sería tener una tabla project_reviews.

            // TODO: Implementar tabla project_reviews para guardar historial de observaciones

            await connection.query('COMMIT');
            return project;

        } catch (error) {
            await connection.query('ROLLBACK');
            console.error("Error al actualizar estado del proyecto:", error);
            throw error;
        }
    },

    /**
     * Obtener proyectos por estado (para revisión)
     */
    async getProjectsByStatus(status) {
        try {
            const connection = await getConnection();
            const query = `SELECT 
                       p.id, p.title, p.short_description, p.created_at, p.owner_id,
                       u.full_name as owner_name,
                       c.name as category_name
                     FROM projects p
                     JOIN users u ON p.owner_id = u.id
                     JOIN categories c ON p.category_id = c.id
                     WHERE p.approval_status = $1 AND p.deleted_at IS NULL
                     ORDER BY p.created_at ASC`;

            const result = await connection.query(query, [status]);
            return result.rows;
        } catch (error) {
            console.error("Error al obtener proyectos por estado:", error);
            throw error;
        }
    },

    /**
     * Actualizar estado de usuario (bloquear/desbloquear)
     */
    async updateUserStatus(userId, status) {
        try {
            const connection = await getConnection();
            const query = `UPDATE users 
                     SET status = $1 
                     WHERE id = $2
                     RETURNING id, full_name, email, status`;

            const result = await connection.query(query, [status, userId]);
            return result.rows[0];
        } catch (error) {
            console.error("Error al actualizar estado de usuario:", error);
            throw error;
        }
    }
};
