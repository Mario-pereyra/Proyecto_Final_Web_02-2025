const pool = require("../db/dbConnection");

const getConnection = () => {
  return pool;
};

/**
 * Repositorio para manejar favoritos de usuario
 */
const favoriteRepository = {
  /**
   * Agregar proyecto a favoritos
   */
  async addFavorite(userId, projectId) {
    const connection = await getConnection();

    try {
      const query = `INSERT INTO saved_projects (user_id, project_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, project_id) DO NOTHING`;
      await connection.query(query, [userId, projectId]);

      return { success: true };
    } catch (error) {
      console.error("Error al agregar favorito:", error);
      throw error;
    }
  },

  /**
   * Quitar proyecto de favoritos
   */
  async removeFavorite(userId, projectId) {
    const connection = await getConnection();

    try {
      const query = `DELETE FROM saved_projects
                     WHERE user_id = $1 AND project_id = $2`;
      await connection.query(query, [userId, projectId]);

      return { success: true };
    } catch (error) {
      console.error("Error al quitar favorito:", error);
      throw error;
    }
  },

  /**
   * Verificar si un proyecto es favorito del usuario
   */
  async isFavorite(userId, projectId) {
    const connection = await getConnection();

    try {
      const query = `SELECT 1 FROM saved_projects
                     WHERE user_id = $1 AND project_id = $2`;
      const result = await connection.query(query, [userId, projectId]);

      return result.rows.length > 0;
    } catch (error) {
      console.error("Error al verificar favorito:", error);
      throw error;
    }
  },

  /**
   * Obtener IDs de proyectos favoritos del usuario
   */
  async getUserFavoriteIds(userId) {
    const connection = await getConnection();

    try {
      const query = `SELECT project_id FROM saved_projects
                     WHERE user_id = $1`;
      const result = await connection.query(query, [userId]);

      return result.rows.map((row) => row.project_id);
    } catch (error) {
      console.error("Error al obtener IDs de favoritos:", error);
      throw error;
    }
  },
};

module.exports = favoriteRepository;
