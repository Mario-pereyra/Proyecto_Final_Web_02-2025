const pool = require("../db/dbConnection");

/**
 * Repositorio para obtener proyectos favoritos de usuario
 */
const userFavoriteRepository = {
  /**
   * Obtener proyectos favoritos de un usuario específico
   */
  async getUserFavorites(userId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          pdv.*,
          sp.saved_at
         FROM saved_projects sp
         INNER JOIN project_details_view pdv ON sp.project_id = pdv.id
         WHERE sp.user_id = $1 
           AND pdv.approval_status = 'publicado'
         ORDER BY sp.saved_at DESC`,
        [userId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }
};

module.exports = userFavoriteRepository;
