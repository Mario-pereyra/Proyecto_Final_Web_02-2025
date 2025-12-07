const pool = require("../db/dbConnection");

const getConnection = () => {
  return pool;
};

/**
 * Repositorio para operaciones de proyectos
 */
module.exports = {
  /**
   * Crear proyecto
   */
  async create(projectData) {
    const connection = await getConnection();
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
      approval_status,
    } = projectData;

    const query = `INSERT INTO projects (
                     owner_id, category_id, title, short_description, story_json,
                     goal_amount, duration_days, started_at, deadline_at, approval_status, created_at
                   ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
                   RETURNING id, title, approval_status, created_at`;

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
      approval_status,
    ];

    const result = await connection.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar imagen del proyecto con metadata completa
   */
  async saveImage(imageData) {
    const connection = await getConnection();
    const { project_id, image_path, original_filename, is_cover } = imageData;

    const query = `INSERT INTO project_images (
                     project_id, image_path, original_filename, is_cover, created_at
                   )
                   VALUES ($1, $2, $3, $4, NOW())
                   RETURNING id, image_path, original_filename`;

    const values = [project_id, image_path, original_filename, is_cover];

    const result = await connection.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar documento del proyecto con metadata completa
   */
  async saveDocument(docData) {
    const connection = await getConnection();
    const {
      project_id,
      requirement_id,
      file_path,
      original_filename,
      mime_type,
    } = docData;

    const query = `INSERT INTO project_requirements_answers (
                     project_id, requirement_id, file_path, original_filename, mime_type
                   )
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING id, file_path, original_filename, mime_type`;

    const values = [
      project_id,
      requirement_id || null,
      file_path,
      original_filename,
      mime_type,
    ];

    const result = await connection.query(query, values);
    return result.rows[0];
  },

  /**
   * Guardar texto de requisitos (sin archivo)
   */
  async saveRequirementAnswer(data) {
    const connection = await getConnection();
    const {
      project_id,
      requirement_id,
      file_path,
      original_filename,
      mime_type,
    } = data;

    const query = `INSERT INTO project_requirements_answers (project_id, requirement_id, file_path, original_filename, mime_type)
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING id`;

    const result = await connection.query(query, [
      project_id,
      requirement_id || null,
      file_path,
      original_filename,
      mime_type,
    ]);
    return result.rows[0];
  },

  /**
   * Obtener portada actual del proyecto (para garbage collection)
   */
  async getCoverImage(projectId) {
    const connection = await getConnection();
    const query = `SELECT id, image_path, original_filename 
                   FROM project_images 
                   WHERE project_id = $1 AND is_cover = TRUE`;

    const result = await connection.query(query, [projectId]);
    return result.rows[0];
  },

  /**
   * Actualizar portada del proyecto (retorna la ruta anterior para eliminación)
   */
  async updateCoverImage(projectId, imageData) {
    const connection = await getConnection();
    const { image_path, original_filename } = imageData;

    // Primero obtener la portada anterior
    const oldCover = await this.getCoverImage(projectId);

    if (oldCover) {
      // Si existe, actualizar
      const query = `UPDATE project_images 
                     SET image_path = $1, original_filename = $2, created_at = NOW()
                     WHERE project_id = $3 AND is_cover = TRUE
                     RETURNING id, image_path, original_filename`;

      const result = await connection.query(query, [image_path, original_filename, projectId]);
      return { updated: result.rows[0], oldPath: oldCover.image_path };
    } else {
      // Si no existe, insertar
      const query = `INSERT INTO project_images (project_id, image_path, original_filename, is_cover, created_at)
                     VALUES ($1, $2, $3, TRUE, NOW())
                     RETURNING id, image_path, original_filename`;

      const result = await connection.query(query, [projectId, image_path, original_filename]);
      return { updated: result.rows[0], oldPath: null };
    }
  },

  /**
   * Obtener respuesta de requisito específico (para garbage collection)
   */
  async getRequirementAnswer(projectId, requirementId) {
    const connection = await getConnection();
    const query = `SELECT id, file_path, original_filename, mime_type
                   FROM project_requirements_answers
                   WHERE project_id = $1 AND requirement_id = $2`;

    const result = await connection.query(query, [projectId, requirementId]);
    return result.rows[0];
  },

  /**
   * Actualizar archivo de requisito (retorna la ruta anterior para eliminación)
   */
  async updateRequirementAnswer(projectId, requirementId, fileData) {
    const connection = await getConnection();
    const { file_path, original_filename, mime_type } = fileData;

    // Primero obtener el archivo anterior
    const oldAnswer = await this.getRequirementAnswer(projectId, requirementId);

    if (oldAnswer) {
      // Si existe, actualizar
      const query = `UPDATE project_requirements_answers
                     SET file_path = $1, original_filename = $2, mime_type = $3, submitted_at = NOW()
                     WHERE project_id = $4 AND requirement_id = $5
                     RETURNING id, file_path, original_filename, mime_type`;

      const result = await connection.query(query, [file_path, original_filename, mime_type, projectId, requirementId]);
      return { updated: result.rows[0], oldPath: oldAnswer.file_path };
    } else {
      // Si no existe, insertar
      const query = `INSERT INTO project_requirements_answers (project_id, requirement_id, file_path, original_filename, mime_type, submitted_at)
                     VALUES ($1, $2, $3, $4, $5, NOW())
                     RETURNING id, file_path, original_filename, mime_type`;

      const result = await connection.query(query, [projectId, requirementId, file_path, original_filename, mime_type]);
      return { updated: result.rows[0], oldPath: null };
    }
  },

  /**
   * Obtener proyectos por usuario con filtro opcional de status
   */
  async getByUserId(userId, status = null) {
    const connection = await getConnection();
    let query = `SELECT 
                   p.id, p.title, p.short_description, p.goal_amount, p.approval_status,
                   p.campaign_status, p.created_at,
                   c.name as category_name
                 FROM projects p
                 JOIN categories c ON p.category_id = c.id
                 WHERE p.owner_id = $1 AND p.deleted_at IS NULL`;

    const values = [userId];

    if (status) {
      query += ` AND p.approval_status = $2`;
      values.push(status);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await connection.query(query, values);
    return result.rows;
  },

  /**
   * Obtener todos los proyectos públicos para el feed (usando la vista)
   */
  async getAllPublic(filters = {}) {
    const connection = await getConnection();
    let query = `SELECT * FROM project_details_view WHERE approval_status = 'publicado'`;
    const values = [];

    // Filtro por categoría
    if (filters.category) {
      values.push(filters.category);
      query += ` AND category_name = $${values.length}`;
    }

    // Ordenamiento
    if (filters.orderBy === "visits") {
      query += ` ORDER BY visit_count DESC, created_at DESC`;
    } else {
      query += ` ORDER BY created_at DESC`;
    }

    // Límite de resultados
    if (filters.limit) {
      values.push(filters.limit);
      query += ` LIMIT $${values.length}`;
    }

    const result = await connection.query(query, values);
    return result.rows;
  },

  /**
   * Obtener proyecto público por ID (desde la vista)
   */
  async getPublicById(projectId) {
    const connection = await getConnection();
    const query = `SELECT * FROM project_details_view 
                   WHERE id = $1 AND approval_status = 'publicado'`;

    const result = await connection.query(query, [projectId]);
    return result.rows[0];
  },

  /**
   * Obtener proyecto por ID (solo del usuario)
   */
  async getById(projectId, userId) {
    const connection = await getConnection();
    const query = `SELECT 
                     p.*, 
                     c.name as category_name,
                     c.description as category_description
                   FROM projects p
                   JOIN categories c ON p.category_id = c.id
                   WHERE p.id = $1 AND p.owner_id = $2 AND p.deleted_at IS NULL`;

    const result = await connection.query(query, [projectId, userId]);
    return result.rows[0];
  },

  /**
   * Obtener imágenes del proyecto
   */
  async getProjectImages(projectId) {
    const connection = await getConnection();
    const query = `SELECT 
                     id, image_path, original_filename, is_cover, created_at
                   FROM project_images
                   WHERE project_id = $1
                   ORDER BY created_at ASC`;

    const result = await connection.query(query, [projectId]);
    return result.rows;
  },

  /**
   * Obtener documentos del proyecto
   */
  async getProjectDocuments(projectId) {
    const connection = await getConnection();
    const query = `SELECT 
                     id, file_path, original_filename, mime_type, submitted_at
                   FROM project_requirements_answers
                   WHERE project_id = $1 AND file_path IS NOT NULL
                   ORDER BY id ASC`;

    const result = await connection.query(query, [projectId]);
    return result.rows;
  },

  /**
   * Obtener donaciones de un proyecto específico
   */
  async getProjectDonations(projectId) {
    const connection = await getConnection();
    try {
      const query = `SELECT 
                       d.id,
                       d.amount,
                       d.created_at,
                       u.full_name as donor_name
                     FROM donations d
                     INNER JOIN users u ON d.user_id = u.id
                     WHERE d.project_id = $1 
                       AND d.status = 'pagado'
                     ORDER BY d.amount DESC, d.created_at DESC`;
      const result = await connection.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error("Error al obtener donaciones del proyecto:", error);
      throw error;
    }
  },

  async softDelete(projectId, userId) {
    const connection = await getConnection();
    const query = `UPDATE projects
                   SET deleted_at = NOW()
                   WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL
                   RETURNING id`;

    const result = await connection.query(query, [projectId, userId]);
    return result.rows[0];
  },

  async update(projectId, userId, projectData) {
    const connection = await getConnection();
    const {
      title,
      short_description,
      story_json,
      goal_amount,
      duration_days,
      started_at,
      deadline_at,
      approval_status,
      category_id,
    } = projectData;

    const query = `UPDATE projects SET
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
                   RETURNING id, title, short_description, goal_amount, approval_status, created_at`;

    const values = [
      title,
      short_description,
      typeof story_json === "string" ? story_json : JSON.stringify(story_json),
      goal_amount,
      duration_days,
      started_at,
      deadline_at,
      approval_status,
      category_id,
      projectId,
      userId,
    ];

    const result = await connection.query(query, values);
    return result.rows[0];
  },

  async submitForReview(projectId, userId) {
    const connection = await getConnection();
    const query = `UPDATE projects 
                   SET approval_status = 'en_revision', updated_at = NOW()
                   WHERE id = $1 AND owner_id = $2 AND approval_status IN ('borrador', 'observado')
                   RETURNING id, title, approval_status`;

    const result = await connection.query(query, [projectId, userId]);
    return result.rows[0];
  },

  async deleteImage(imageId, projectId) {
    const connection = await getConnection();
    const query = `DELETE FROM project_images 
                   WHERE id = $1 AND project_id = $2
                   RETURNING image_path`;

    const result = await connection.query(query, [imageId, projectId]);
    return result.rows[0];
  },

  /**
   * Buscar proyectos con filtros avanzados
   */
  async searchProjects(filters = {}) {
    const connection = await getConnection();
    let query = `SELECT * FROM project_details_view WHERE approval_status = 'publicado'`;
    const values = [];

    if (filters.searchTerm) {
      values.push(`%${filters.searchTerm}%`);
      query += ` AND (title ILIKE $${values.length} OR short_description ILIKE $${values.length})`;
    }

    if (filters.category) {
      values.push(filters.category);
      query += ` AND category_name ILIKE $${values.length}`;
    }

    // Filtro por Meta de Financiación (Máxima)
    if (filters.maxGoal) {
      values.push(filters.maxGoal);
      query += ` AND goal_amount <= $${values.length}`;
    }

    // Filtros de Progreso
    if (filters.minProgress !== undefined) {
      values.push(filters.minProgress);
      query += ` AND progress_percentage >= $${values.length}`;
    }

    if (filters.maxProgress !== undefined && filters.maxProgress < 100) {
      // Nota: si es 100 o más, generalmente queremos ver todos los de 100, asi que solo filtramos si es menor para rangos.
      // O si el usuario pide explícitamente "menos de X".
      // La lógica del frontend manda 99.99 para "menos de 100", o 100 para "100".
      // Ajustamos según lo que llegue.
      values.push(filters.maxProgress);
      query += ` AND progress_percentage <= $${values.length}`;
    } else if (filters.maxProgress !== undefined && filters.maxProgress == 100) {
      // Caso especial para "completamente financiado"
      values.push(100);
      query += ` AND progress_percentage >= $${values.length}`;
    }

    // Ordenamiento
    switch (filters.orderBy) {
      case 'popular': // mas_populares
        query += ` ORDER BY visit_count DESC`;
        break;
      case 'closing_soon': // proximos_a_finalizar
        query += ` ORDER BY deadline_at ASC`;
        break;
      case 'high_goal': // meta_mayor
        query += ` ORDER BY goal_amount DESC`;
        break;
      case 'low_goal': // meta_menor
        query += ` ORDER BY goal_amount ASC`;
        break;
      case 'recent': // mas_recientes
      default:
        query += ` ORDER BY created_at DESC`;
        break;
    }

    // Paginación
    if (filters.limit) {
      values.push(filters.limit);
      query += ` LIMIT $${values.length}`;
    }

    if (filters.offset) {
      values.push(filters.offset);
      query += ` OFFSET $${values.length}`;
    }

    const result = await connection.query(query, values);
    return result.rows;
  },

  /**
 * Crear proyecto con transacción completa
 */
  async createWithTransaction(projectData, images, requirements) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Insertar proyecto
      const {
        owner_id, category_id, title, short_description, story_json,
        goal_amount, duration_days, started_at, deadline_at, approval_status
      } = projectData;

      const projectQuery = `
        INSERT INTO projects (
          owner_id, category_id, title, short_description, story_json,
          goal_amount, duration_days, started_at, deadline_at, approval_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING id`;

      const projectResult = await client.query(projectQuery, [
        owner_id, category_id, title, short_description, story_json,
        goal_amount, duration_days, started_at, deadline_at, approval_status
      ]);

      const projectId = projectResult.rows[0].id;

      // 2. Insertar Imágenes
      if (images && images.length > 0) {
        for (const img of images) {
          const imgQuery = `
            INSERT INTO project_images (project_id, image_path, original_filename, is_cover, created_at)
            VALUES ($1, $2, $3, $4, NOW())`;
          await client.query(imgQuery, [projectId, img.image_path, img.original_filename, img.is_cover]);
        }
      }

      // 3. Insertar Requisitos
      if (requirements && requirements.length > 0) {
        for (const req of requirements) {
          const reqQuery = `
            INSERT INTO project_requirements_answers (
              project_id, requirement_id, file_path, original_filename, mime_type, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`;
          await client.query(reqQuery, [projectId, req.requirement_id, req.file_path, req.original_filename, req.mime_type]);
        }
      }

      await client.query("COMMIT");
      return projectId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Actualizar proyecto con transacción completa
   */
  async updateWithTransaction(projectId, userId, projectData, images, requirements) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Verificar propiedad
      const checkOwner = await client.query(
        'SELECT id, approval_status FROM projects WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL',
        [projectId, userId]
      );

      if (checkOwner.rows.length === 0) {
        throw new Error("PROYECTO_NO_ENCONTRADO");
      }

      // 1. Actualizar Datos Básicos
      const {
        title, short_description, story_json, category_id,
        goal_amount, duration_days, started_at, deadline_at
      } = projectData;

      const updateQuery = `
        UPDATE projects SET
          category_id = $1, title = $2, short_description = $3, story_json = $4,
          goal_amount = $5, duration_days = $6, started_at = $7, deadline_at = $8,
          updated_at = NOW()
        WHERE id = $9 AND owner_id = $10`;

      await client.query(updateQuery, [
        category_id, title, short_description, story_json,
        goal_amount, duration_days, started_at, deadline_at,
        projectId, userId
      ]);

      // 2. Manejar Imágenes (Solo si hay nuevas)
      if (images && images.length > 0) {
        for (const img of images) {
          // Si es cover, borrar anterior logicamente de la base (fisicamente se borra en controller/service)
          if (img.is_cover) {
            await client.query('DELETE FROM project_images WHERE project_id = $1 AND is_cover = TRUE', [projectId]);
          }
          const imgQuery = `
            INSERT INTO project_images (project_id, image_path, original_filename, is_cover, created_at)
            VALUES ($1, $2, $3, $4, NOW())`;
          await client.query(imgQuery, [projectId, img.image_path, img.original_filename, img.is_cover]);
        }
      }

      // 3. Manejar Requisitos (Solo si hay nuevos)
      if (requirements && requirements.length > 0) {
        for (const req of requirements) {
          // Borrar respuesta previa para este requisito
          await client.query('DELETE FROM project_requirements_answers WHERE project_id = $1 AND requirement_id = $2', [projectId, req.requirement_id]);

          const reqQuery = `
            INSERT INTO project_requirements_answers (
              project_id, requirement_id, file_path, original_filename, mime_type, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`;
          await client.query(reqQuery, [projectId, req.requirement_id, req.file_path, req.original_filename, req.mime_type]);
        }
      }

      await client.query("COMMIT");
      return projectId;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
};
