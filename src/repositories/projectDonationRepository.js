const pool = require("../db/dbConnection");

/**
 * Repositorio para obtener donaciones de un proyecto
 */
const projectDonationRepository = {
  /**
   * Obtener donaciones de un proyecto específico
   */
  async getProjectDonations(projectId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT 
          d.id,
          d.amount,
          d.created_at,
          u.full_name as donor_name
         FROM donations d
         INNER JOIN users u ON d.user_id = u.id
         WHERE d.project_id = $1 
           AND d.status = 'pagado'
         ORDER BY d.amount DESC, d.created_at DESC`,
        [projectId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  }
};

module.exports = projectDonationRepository;
