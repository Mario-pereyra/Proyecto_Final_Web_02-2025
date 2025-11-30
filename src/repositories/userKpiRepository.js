const pool = require("../db/dbConnection");

/**
 * Repositorio para obtener KPIs de usuario
 */
const userKpiRepository = {
  /**
   * Obtener KPIs de un usuario específico
   */
  async getUserKPIs(userId) {
    const client = await pool.connect();
    
    try {
      // Total de proyectos del usuario
      const projectsResult = await client.query(
        `SELECT COUNT(*) as total 
         FROM projects 
         WHERE owner_id = $1 AND deleted_at IS NULL`,
        [userId]
      );

      // Campañas activas (proyectos publicados en progreso)
      const activeCampaignsResult = await client.query(
        `SELECT COUNT(*) as total 
         FROM projects 
         WHERE owner_id = $1 
           AND approval_status = 'publicado' 
           AND campaign_status = 'en_progreso'
           AND deleted_at IS NULL`,
        [userId]
      );

      // Total recaudado (suma de donaciones a proyectos del usuario)
      const totalRaisedResult = await client.query(
        `SELECT COALESCE(SUM(d.amount), 0) as total
         FROM donations d
         INNER JOIN projects p ON d.project_id = p.id
         WHERE p.owner_id = $1 
           AND d.status = 'pagado'
           AND p.deleted_at IS NULL`,
        [userId]
      );

      // Total donado (suma de donaciones hechas por el usuario)
      const totalDonatedResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM donations
         WHERE user_id = $1 
           AND status = 'pagado'`,
        [userId]
      );

      return {
        totalProjects: parseInt(projectsResult.rows[0].total),
        activeCampaigns: parseInt(activeCampaignsResult.rows[0].total),
        totalRaised: parseFloat(totalRaisedResult.rows[0].total),
        totalDonated: parseFloat(totalDonatedResult.rows[0].total)
      };
    } finally {
      client.release();
    }
  }
};

module.exports = userKpiRepository;
