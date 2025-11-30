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
      short_description,
      story_json,
      goal_amount,
      duration_days,
      started_at,
      deadline_at,
      approval_status
    } = projectData;
    
    const query = `
      INSERT INTO projects (
        owner_id, category_id, title, short_description, story_json,
        goal_amount, duration_days, started_at, deadline_at, approval_status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, title, approval_status, created_at
    `;
    
    const values = [
      owner_id,
      category_id,
      title,
      short_description,
      JSON.stringify(story_json),
      goal_amount,
      duration_days,
      started_at,
      deadline_at,
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
      image_path, 
      original_filename,
      is_cover
    } = imageData;
    
    const query = `
      INSERT INTO project_images (
        project_id, image_path, original_filename, is_cover, created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, image_path, original_filename
    `;
    
    const values = [
      project_id, 
      image_path, 
      original_filename,
      is_cover
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
      file_path,
      original_filename,
      mime_type
    } = docData;
    
    const query = `
      INSERT INTO project_requirements_answers (
        project_id, requirement_id, file_path, original_filename, mime_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, file_path, original_filename, mime_type
    `;
    
    const values = [
      project_id,
      requirement_id || null,
      file_path,
      original_filename,
      mime_type
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar texto de requisitos (sin archivo)
   */
  async saveRequirementAnswer(data) {
    const { project_id, requirement_id, file_path, original_filename, mime_type } = data;
    
    const query = `
      INSERT INTO project_requirements_answers (project_id, requirement_id, file_path, original_filename, mime_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const result = await pool.query(query, [project_id, requirement_id || null, file_path, original_filename, mime_type]);
    return result.rows[0];
  },

  /**
   * Obtener proyectos por usuario con filtro opcional de status
   */
  async getByUserId(userId, status = null) {
    let query = `
      SELECT 
        p.id, p.title, p.short_description, p.goal_amount, p.approval_status,
        p.campaign_status, p.created_at,
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
   * Obtener todos los proyectos públicos para el feed (usando la vista)
   */
  async getAllPublic(filters = {}) {
    let query = `SELECT * FROM project_details_view WHERE approval_status = 'publicado'`;
    const values = [];
    
    // Filtro por categoría
    if (filters.category) {
      values.push(filters.category);
      query += ` AND category_name = $${values.length}`;
    }

    // Ordenamiento
    if (filters.orderBy === 'visits') {
      query += ` ORDER BY visit_count DESC, created_at DESC`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }
    
    // Límite de resultados
    if (filters.limit) {
      values.push(filters.limit);
      query += ` LIMIT $${values.length}`;
    }
    
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
        id, image_path, original_filename, is_cover, created_at
      FROM project_images
      WHERE project_id = $1
      ORDER BY created_at ASC
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
        id, file_path, original_filename, mime_type, submitted_at
      FROM project_requirements_answers
      WHERE project_id = $1 AND file_path IS NOT NULL
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
  },

  /**
   * Actualizar proyecto existente
   */
  async update(projectId, userId, projectData) {
    const {
      title,
      short_description,
      story_json,
      goal_amount,
      duration_days,
      started_at,
      deadline_at,
      approval_status,
      category_id
    } = projectData;
    
    const query = `
      UPDATE projects SET
        title = $1,
        short_description = $2,
        story_json = $3,
        goal_amount = $4,
        duration_days = $5,
        started_at = $6,
        deadline_at = $7,
        approval_status = $8,
        category_id = $9,
        updated_at = NOW()
      WHERE id = $10 AND owner_id = $11 AND deleted_at IS NULL
      RETURNING id, title, short_description, goal_amount, approval_status, created_at
    `;
    
    const values = [
      title,
      short_description,
      typeof story_json === 'string' ? story_json : JSON.stringify(story_json),
      goal_amount,
      duration_days,
      started_at,
      deadline_at,
      approval_status,
      category_id,
      projectId,
      userId
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};
