const pool = require('../db/dbConnection');

/**
 * Repositorio para operaciones de proyectos
 */
module.exports = {
  /**
   * Crear proyecto
   */
  async create(projectData) {
    const {
      owner_id,
      category_id,
      title,
      summary,
      description_json,
      goal_amount,
      start_date,
      end_date,
      approval_status
    } = projectData;
    
    const query = `
      INSERT INTO projects (
        owner_id, category_id, title, summary, description_json,
        goal_amount, start_date, end_date, approval_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id, title, approval_status, created_at
    `;
    
    const values = [
      owner_id,
      category_id,
      title,
      summary,
      JSON.stringify(description_json),
      goal_amount,
      start_date,
      end_date,
      approval_status
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar imagen del proyecto con metadata completa
   */
  async saveImage(imageData) {
    const { 
      project_id, 
      url, 
      original_filename,
      file_size,
      mime_type,
      position, 
      is_cover,
      alt_text
    } = imageData;
    
    const query = `
      INSERT INTO project_images (
        project_id, url, original_filename, file_size, mime_type,
        position, is_cover, alt_text, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, url, original_filename, file_size, mime_type
    `;
    
    const values = [
      project_id, 
      url, 
      original_filename,
      file_size,
      mime_type,
      position, 
      is_cover,
      alt_text
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar documento del proyecto con metadata completa
   */
  async saveDocument(docData) {
    const { 
      project_id, 
      requirement_id,
      file_url,
      original_filename,
      file_size,
      mime_type,
      value_text
    } = docData;
    
    const query = `
      INSERT INTO project_requirement_answers (
        project_id, requirement_id, file_url, original_filename,
        file_size, mime_type, value_text
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, file_url, original_filename, file_size, mime_type
    `;
    
    const values = [
      project_id,
      requirement_id || null,
      file_url,
      original_filename,
      file_size,
      mime_type,
      value_text
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar texto de requisitos (sin archivo)
   */
  async saveRequirementAnswer(data) {
    const { project_id, requirement_id, value_text } = data;
    
    const query = `
      INSERT INTO project_requirement_answers (project_id, requirement_id, value_text)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    const result = await pool.query(query, [project_id, requirement_id || null, value_text]);
    return result.rows[0];
  },

  /**
   * Obtener proyectos por usuario con filtro opcional de status
   */
  async getByUserId(userId, status = null) {
    let query = `
      SELECT 
        p.id, p.title, p.summary, p.goal_amount, p.approval_status,
        p.campaign_state, p.created_at, p.published_at,
        c.name as category_name
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.owner_id = $1 AND p.deleted_at IS NULL
    `;
    
    const values = [userId];
    
    if (status) {
      query += ` AND p.approval_status = $2`;
      values.push(status);
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const result = await pool.query(query, values);
    return result.rows;
  },

  /**
   * Obtener proyecto por ID (solo del usuario)
   */
  async getById(projectId, userId) {
    const query = `
      SELECT 
        p.*, 
        c.name as category_name,
        c.description as category_description
      FROM projects p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.owner_id = $2 AND p.deleted_at IS NULL
    `;
    
    const result = await pool.query(query, [projectId, userId]);
    return result.rows[0];
  },

  /**
   * Obtener imágenes del proyecto
   */
  async getProjectImages(projectId) {
    const query = `
      SELECT 
        id, url, original_filename, file_size, mime_type,
        position, is_cover, alt_text, created_at
      FROM project_images
      WHERE project_id = $1
      ORDER BY position ASC
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  },

  /**
   * Obtener documentos del proyecto
   */
  async getProjectDocuments(projectId) {
    const query = `
      SELECT 
        id, file_url, original_filename, file_size, mime_type,
        value_text, created_at
      FROM project_requirement_answers
      WHERE project_id = $1 AND file_url IS NOT NULL
      ORDER BY id ASC
    `;
    
    const result = await pool.query(query, [projectId]);
    return result.rows;
  },

  /**
   * Soft delete de proyecto
   */
  async softDelete(projectId, userId) {
    const query = `
      UPDATE projects
      SET deleted_at = NOW()
      WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL
      RETURNING id
    `;
    
    const result = await pool.query(query, [projectId, userId]);
    return result.rows[0];
  }
};
