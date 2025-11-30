const pool = require("../db/dbConnection");

/**
 * Repositorio para manejar favoritos de usuario
 */
const favoriteRepository = {
  /**
   * Agregar proyecto a favoritos
   */
  async addFavorite(userId, projectId) {
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO saved_projects (user_id, project_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, project_id) DO NOTHING`,
        [userId, projectId]
      );
      
      return { success: true };
    } finally {
      client.release();
    }
  },

  /**
   * Quitar proyecto de favoritos
   */
  async removeFavorite(userId, projectId) {
    const client = await pool.connect();
    
    try {
      await client.query(
        `DELETE FROM saved_projects
         WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
      );
      
      return { success: true };
    } finally {
      client.release();
    }
  },

  /**
   * Verificar si un proyecto es favorito del usuario
   */
  async isFavorite(userId, projectId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 1 FROM saved_projects
         WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
      );
      
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  },

  /**
   * Obtener IDs de proyectos favoritos del usuario
   */
  async getUserFavoriteIds(userId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT project_id FROM saved_projects
         WHERE user_id = $1`,
        [userId]
      );
      
      return result.rows.map(row => row.project_id);
    } finally {
      client.release();
    }
  }
};

module.exports = favoriteRepository;
