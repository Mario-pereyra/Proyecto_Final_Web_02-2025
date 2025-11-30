const pool = require("../db/dbConnection");

/**
 * Repositorio para búsqueda y filtrado de proyectos
 */
const projectSearchRepository = {
  /**
   * Buscar proyectos con filtros avanzados
   */
  async searchProjects(filters = {}) {
    const client = await pool.connect();
    
    try {
      const {
        search = '',
        category = '',
        orderBy = 'created_at',
        minGoal = 0,
        maxGoal = null,
        minProgress = 0,
        maxProgress = 100
      } = filters;

      let query = `
        SELECT 
          pdv.*
        FROM project_details_view pdv
        WHERE pdv.approval_status = 'publicado'
      `;
      
      const params = [];
      let paramIndex = 1;

      // Filtro de búsqueda por texto (título o descripción)
      if (search && search.trim()) {
        query += ` AND (
          LOWER(pdv.title) LIKE LOWER($${paramIndex}) OR 
          LOWER(pdv.short_description) LIKE LOWER($${paramIndex})
        )`;
        params.push(`%${search.trim()}%`);
        paramIndex++;
      }

      // Filtro por categoría
      if (category && category !== 'todas') {
        query += ` AND LOWER(pdv.category_name) = LOWER($${paramIndex})`;
        params.push(category);
        paramIndex++;
      }

      // Filtro por meta de financiación
      if (minGoal > 0) {
        query += ` AND pdv.goal_amount >= $${paramIndex}`;
        params.push(minGoal);
        paramIndex++;
      }

      if (maxGoal) {
        query += ` AND pdv.goal_amount <= $${paramIndex}`;
        params.push(maxGoal);
        paramIndex++;
      }

      // Filtro por progreso de financiación
      if (minProgress > 0) {
        query += ` AND pdv.progress_percentage >= $${paramIndex}`;
        params.push(minProgress);
        paramIndex++;
      }

      if (maxProgress < 100) {
        query += ` AND pdv.progress_percentage <= $${paramIndex}`;
        params.push(maxProgress);
        paramIndex++;
      }

      // Ordenamiento
      const validOrderBy = {
        'mas_recientes': 'pdv.created_at DESC',
        'mas_populares': 'pdv.visit_count DESC',
        'proximos_a_finalizar': 'pdv.days_remaining ASC',
        'meta_mayor': 'pdv.goal_amount DESC',
        'meta_menor': 'pdv.goal_amount ASC',
        'created_at': 'pdv.created_at DESC'
      };

      const orderClause = validOrderBy[orderBy] || validOrderBy['created_at'];
      query += ` ORDER BY ${orderClause}`;

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
};

module.exports = projectSearchRepository;
