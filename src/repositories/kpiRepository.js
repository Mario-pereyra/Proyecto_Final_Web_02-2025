const pool = require("../db/dbConnection");

const getConnection = () => {
  return pool;
};

/**
 * Obtener KPIs generales de la plataforma
 * @returns {Promise<Object>} Objeto con los KPIs
 */
exports.getKPIs = async () => {
  try {
    const connection = await getConnection();
    
    // Query para obtener todos los KPIs en una sola consulta
    const query = `
      SELECT 
        -- Proyectos Financiados (publicados que alcanzaron su meta)
        (SELECT COUNT(*) FROM (
          SELECT p.id
          FROM projects p
          LEFT JOIN donations d ON p.id = d.project_id AND d.status = 'pagado'
          WHERE p.approval_status = 'publicado' 
            AND p.deleted_at IS NULL
          GROUP BY p.id
          HAVING COALESCE(SUM(d.amount), 0) >= p.goal_amount
        ) funded_projects) as proyectos_financiados,
        
        -- Creadores Apoyados (usuarios con al menos un proyecto publicado)
        (SELECT COUNT(DISTINCT owner_id) 
         FROM projects 
         WHERE approval_status = 'publicado' 
           AND deleted_at IS NULL
        ) as creadores_apoyados,
        
        -- Total Recaudado (suma de todas las donaciones pagadas)
        (SELECT COALESCE(SUM(amount), 0)
         FROM donations
         WHERE status = 'pagado'
        ) as total_recaudado
    `;
    
    const data = await connection.query(query);
    
    // Formatear el resultado
    const kpis = data.rows[0] || {
      proyectos_financiados: 0,
      creadores_apoyados: 0,
      total_recaudado: 0
    };
    
    return {
      proyectosFinanciados: parseInt(kpis.proyectos_financiados) || 0,
      creadoresApoyados: parseInt(kpis.creadores_apoyados) || 0,
      totalRecaudado: parseFloat(kpis.total_recaudado) || 0
    };
  } catch (error) {
    console.error("Error al obtener KPIs:", error);
    throw error;
  }
};
