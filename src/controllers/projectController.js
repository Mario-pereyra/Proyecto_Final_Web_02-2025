const projectRepository = require('../repositories/projectRepository');
const { deleteFile, deleteFileSync } = require('../utils/fileHelper');

/**
 * POST /api/projects
 * Crear proyecto completo con imágenes y documentos
 */
exports.createProject = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 1; // Temporal: hardcoded user
    const {
      title,
      summary,
      category_id,
      description_json,
      goal_amount,
      start_date,
      end_date,
      requirements_text,
      approval_status
    } = req.body;

    // Validaciones básicas
    if (!title || !category_id || !goal_amount || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: title, category_id, goal_amount, end_date'
      });
    }

    // 1. Crear proyecto
    const project = await projectRepository.create({
      owner_id: userId,
      category_id: parseInt(category_id),
      title,
      short_description: summary,
      story_json: description_json ? JSON.parse(description_json) : {},
      goal_amount: parseFloat(goal_amount),
      duration_days: end_date ? Math.ceil((new Date(end_date) - new Date(start_date || new Date())) / (1000 * 60 * 60 * 24)) : null,
      started_at: start_date || null,
      deadline_at: end_date || null,
      approval_status: approval_status || 'borrador'
    });

    const projectId = project.id;

    // 2. Guardar imagen principal con metadata
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      const imageFile = req.files.mainImage[0];
      const imageUrl = `uploads/img/${imageFile.filename}`; // RF-REC-01

      await projectRepository.saveImage({
        project_id: projectId,
        image_path: imageUrl,
        original_filename: imageFile.originalname,
        is_cover: true
      });
    }

    // 3. Guardar documentos con metadata
    if (req.files && req.files.documents) {
      for (const doc of req.files.documents) {
        const fileUrl = `uploads/files/${doc.filename}`; // RF-REC-01

        await projectRepository.saveDocument({
          project_id: projectId,
          requirement_id: null,
          file_path: fileUrl,
          original_filename: doc.originalname,
          mime_type: doc.mimetype
        });
      }
    }

    // 4. Guardar requisitos de texto (si no hay documentos)
    if (requirements_text && (!req.files || !req.files.documents || req.files.documents.length === 0)) {
      await projectRepository.saveRequirementAnswer({
        project_id: projectId,
        requirement_id: null,
        value_text: requirements_text
      });
    }

    res.status(201).json({
      success: true,
      message: approval_status === 'borrador'
        ? 'Proyecto guardado como borrador'
        : 'Proyecto enviado para revisión',
      projectId: projectId,
      project: {
        id: projectId,
        title: project.title,
        status: project.approval_status,
        created_at: project.created_at
      }
    });

  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el proyecto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/projects
 * Obtener proyectos del usuario con filtro opcional de status
 */
exports.getAllProjects = async (req, res) => {
  try {
    if (req.user) {
      const { status } = req.query;
      const projects = await projectRepository.getByUserId(req.user.id, status);
      return res.json({
        success: true,
        count: projects.length,
        projects
      });
    }

    const { category, orderBy, limit } = req.query;
    const projects = await projectRepository.getAllPublic({
      category,
      orderBy,
      limit: limit ? parseInt(limit) : null
    });

    res.json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos'
    });
  }
};

/**
 * GET /api/projects/search
 * Buscar proyectos con filtros
 */
exports.searchProjects = async (req, res) => {
  try {
    const { q, category, status, orderBy, limit, offset } = req.query;

    const filters = {
      searchTerm: q,
      category: category ? parseInt(category) : null,
      status,
      orderBy: orderBy || 'recent',
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    };

    const results = await projectRepository.searchProjects(filters);

    res.json({
      success: true,
      count: results.length,
      projects: results,
      filters: filters
    });
  } catch (error) {
    console.error('Error en búsqueda de proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar proyectos'
    });
  }
};

/**
 * GET /api/projects/:id
 * Obtener proyecto específico (público)
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectRepository.getPublicById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyecto'
    });
  }
};

/**
 * PATCH /api/projects/:id
 * Actualizar proyecto existente
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1;
    const {
      title,
      summary,
      category_id,
      description_json,
      goal_amount,
      start_date,
      end_date,
      approval_status
    } = req.body;

    if (!title || !category_id || !goal_amount || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: title, category_id, goal_amount, end_date'
      });
    }

    const updatedProject = await projectRepository.update(id, userId, {
      title,
      short_description: summary,
      story_json: description_json ? JSON.parse(description_json) : {},
      category_id: parseInt(category_id),
      goal_amount: parseFloat(goal_amount),
      duration_days: end_date ? Math.ceil((new Date(end_date) - new Date(start_date || new Date())) / (1000 * 60 * 60 * 24)) : null,
      started_at: start_date || null,
      deadline_at: end_date || null,
      approval_status: approval_status || 'borrador'
    });

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado o no tienes permisos para editarlo'
      });
    }

    res.json({
      success: true,
      message: approval_status === 'borrador'
        ? 'Borrador actualizado correctamente'
        : 'Proyecto actualizado y enviado para revisión',
      projectId: id,
      project: updatedProject
    });

  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el proyecto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/projects/:id/submit
 * Enviar proyecto para revisión
 */
exports.submitProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1;

    const project = await projectRepository.submitForReview(id, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado o no tienes permisos'
      });
    }

    res.json({
      success: true,
      message: 'Proyecto enviado para revisión',
      project
    });
  } catch (error) {
    console.error('Error al enviar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar proyecto para revisión'
    });
  }
};

/**
 * POST /api/projects/:id/images
 * Upload adicional de imágenes
 */
exports.uploadProjectImages = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const userId = req.user ? req.user.id : 1;

    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se recibieron imágenes'
      });
    }

    const uploadedImages = [];
    for (const imageFile of req.files.images) {
      const imageUrl = `uploads/img/${imageFile.filename}`; // RF-REC-01

      const savedImage = await projectRepository.saveImage({
        project_id: parseInt(projectId),
        image_path: imageUrl,
        original_filename: imageFile.originalname,
        is_cover: false
      });

      uploadedImages.push(savedImage);
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} imagen(es) agregada(s)`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error al subir imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/projects/:id/images/:imageId
 * Eliminar imagen
 */
exports.deleteProjectImage = async (req, res) => {
  try {
    const { id: projectId, imageId } = req.params;
    const userId = req.user ? req.user.id : 1;

    const imageData = await projectRepository.deleteImage(projectId, imageId, userId);

    if (!imageData) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada o no tienes permisos'
      });
    }

    // RF-REC-01: Garbage collection - eliminar archivo físico
    if (imageData.image_path) {
      deleteFile(imageData.image_path);
    }

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen'
    });
  }
};

/**
 * PATCH /api/projects/:id/cover
 * Actualizar portada del proyecto (RF-REC-01)
 */
exports.updateProjectCover = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Debe subir una imagen de portada."
    });
  }

  const newFilePath = `uploads/img/${req.file.filename}`;
  const originalName = req.file.originalname;

  try {
    const result = await projectRepository.updateCoverImage(id, {
      image_path: newFilePath,
      original_filename: originalName
    });

    if (result.oldPath) {
      deleteFile(result.oldPath);
    }

    return res.json({
      success: true,
      message: result.oldPath ? "Portada actualizada y archivo anterior eliminado" : "Portada agregada",
      image: result.updated
    });
  } catch (error) {
    console.error("Error al actualizar portada:", error);
    deleteFileSync(newFilePath);

    return res.status(500).json({
      success: false,
      error: "Error al actualizar portada"
    });
  }
};

/**
 * PATCH /api/projects/:id/requirements/:requirementId/file
 * Actualizar archivo de requisito (RF-REC-01)
 */
exports.updateRequirementFile = async (req, res) => {
  const { id: projectId, requirementId } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: "Debe subir un archivo."
    });
  }

  const newFilePath = `uploads/files/${req.file.filename}`;
  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;

  try {
    const result = await projectRepository.updateRequirementAnswer(projectId, requirementId, {
      file_path: newFilePath,
      original_filename: originalName,
      mime_type: mimeType
    });

    if (result.oldPath) {
      deleteFile(result.oldPath);
    }

    return res.json({
      success: true,
      message: result.oldPath ? "Archivo actualizado y anterior eliminado" : "Archivo agregado",
      answer: result.updated
    });
  } catch (error) {
    console.error("Error al actualizar archivo de requisito:", error);
    deleteFileSync(newFilePath);

    return res.status(500).json({
      success: false,
      error: "Error al actualizar archivo"
    });
  }
};

/**
 * DELETE /api/projects/:id
 * Soft delete de proyecto
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1;

    const result = await projectRepository.softDelete(id, userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Proyecto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto'
    });
  }
};

/**
 * GET /api/projects/:projectId/donations
 * Obtener donaciones de un proyecto
 */
exports.getProjectDonations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const donations = await projectRepository.getDonationsByProjectId(projectId);

    res.json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    console.error("Error al obtener donaciones del proyecto:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener donaciones del proyecto"
    });
  }
};

/**
 * POST /api/projects/save
 * Endpoint unificado para crear o actualizar proyectos (RF-PROY-01)
 * Detecta si es creación o edición según presencia de 'id' en body
 * Maneja archivos dinámicos con multer.any()
 */
exports.saveProject = async (req, res) => {
  const pool = require('../db/dbConnection');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      id: projectId,
      title,
      short_description,
      category_id,
      goal_amount,
      duration_days,
      story_json,
      started_at,
      deadline_at
    } = req.body;

    const userId = req.user ? req.user.id : 1;
    const isUpdate = !!projectId;

    if (!title || title.trim() === '') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'El título es obligatorio'
      });
    }

    let finalProjectId;

    if (isUpdate) {
      const checkOwner = await client.query(
        'SELECT id, approval_status FROM projects WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL',
        [projectId, userId]
      );

      if (checkOwner.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado o no tienes permisos'
        });
      }

      const currentStatus = checkOwner.rows[0].approval_status;
      if (currentStatus !== 'borrador' && currentStatus !== 'observado') {
        await client.query('ROLLBACK');
        return res.status(403).json({
          success: false,
          message: 'Solo puedes editar proyectos en borrador u observados'
        });
      }

      await client.query(`
        UPDATE projects SET
          category_id = $1,
          title = $2,
          short_description = $3,
          story_json = $4,
          goal_amount = $5,
          duration_days = $6,
          started_at = $7,
          deadline_at = $8,
          updated_at = NOW()
        WHERE id = $9 AND owner_id = $10
      `, [
        category_id,
        title,
        short_description,
        story_json || '{}',
        goal_amount || null,
        duration_days || null,
        started_at || null,
        deadline_at || null,
        projectId,
        userId
      ]);

      finalProjectId = projectId;
    } else {
      const result = await client.query(`
        INSERT INTO projects (
          owner_id, category_id, title, short_description, story_json,
          goal_amount, duration_days, started_at, deadline_at,
          approval_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'borrador', NOW())
        RETURNING id
      `, [
        userId,
        category_id,
        title,
        short_description,
        story_json || '{}',
        goal_amount || null,
        duration_days || null,
        started_at || null,
        deadline_at || null
      ]);

      finalProjectId = result.rows[0].id;
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname === 'cover_image') {
          const newCoverPath = `uploads/img/${file.filename}`;

          if (isUpdate) {
            const oldCover = await client.query(
              'SELECT image_path FROM project_images WHERE project_id = $1 AND is_cover = TRUE',
              [finalProjectId]
            );

            if (oldCover.rows.length > 0) {
              deleteFile(oldCover.rows[0].image_path);
              await client.query(
                'DELETE FROM project_images WHERE project_id = $1 AND is_cover = TRUE',
                [finalProjectId]
              );
            }
          }

          await client.query(`
            INSERT INTO project_images (project_id, image_path, original_filename, is_cover, created_at)
            VALUES ($1, $2, $3, TRUE, NOW())
          `, [finalProjectId, newCoverPath, file.originalname]);
        }

        if (file.fieldname.startsWith('req_')) {
          const requirementId = parseInt(file.fieldname.split('_')[1]);
          const newFilePath = `uploads/files/${file.filename}`;

          if (isUpdate) {
            const oldReq = await client.query(
              'SELECT file_path FROM project_requirements_answers WHERE project_id = $1 AND requirement_id = $2',
              [finalProjectId, requirementId]
            );

            if (oldReq.rows.length > 0) {
              deleteFile(oldReq.rows[0].file_path);
              await client.query(
                'DELETE FROM project_requirements_answers WHERE project_id = $1 AND requirement_id = $2',
                [finalProjectId, requirementId]
              );
            }
          }

          await client.query(`
            INSERT INTO project_requirements_answers (
              project_id, requirement_id, file_path, original_filename, mime_type, submitted_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
          `, [finalProjectId, requirementId, newFilePath, file.originalname, file.mimetype]);
        }
      }
    }

    await client.query('COMMIT');

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente',
      projectId: finalProjectId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en saveProject:', error);

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = file.fieldname === 'cover_image'
          ? `uploads/img/${file.filename}`
          : `uploads/files/${file.filename}`;
        deleteFileSync(filePath);
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al guardar el proyecto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};
