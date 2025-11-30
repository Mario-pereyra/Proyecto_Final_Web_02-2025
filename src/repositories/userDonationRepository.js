const pool = require("../db/dbConnection");

/**
 * Repositorio para obtener donaciones de usuario
 */
const userDonationRepository = {
  /**
   * Obtener donaciones de un usuario específico
   */
  async getUserDonations(userId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          d.id,
          d.project_id,
          d.amount,
          d.created_at,
          p.title as project_title,
          c.name as category_name
         FROM donations d
         INNER JOIN projects p ON d.project_id = p.id
         INNER JOIN categories c ON p.category_id = c.id
         WHERE d.user_id = $1 
           AND d.status = 'pagado'
         ORDER BY d.created_at DESC`,
        [userId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }
};

module.exports = userDonationRepository;
