const projectRepository = require('../repositories/projectRepository');

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
      summary,
      description_json: description_json ? JSON.parse(description_json) : {},
      goal_amount: parseFloat(goal_amount),
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date,
      approval_status: approval_status || 'borrador'
    });

    const projectId = project.id;

    // 2. Guardar imagen principal con metadata
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      const imageFile = req.files.mainImage[0];
      const imageUrl = `/uploads/images/${imageFile.filename}`;

      await projectRepository.saveImage({
        project_id: projectId,
        url: imageUrl,
        original_filename: imageFile.originalname,
        file_size: imageFile.size,
        mime_type: imageFile.mimetype,
        position: 1,
        is_cover: true,
        alt_text: title
      });
    }

    // 3. Guardar documentos con metadata
    if (req.files && req.files.documents) {
      for (const doc of req.files.documents) {
        const fileUrl = `/uploads/files/${doc.filename}`;

        await projectRepository.saveDocument({
          project_id: projectId,
          requirement_id: null,
          file_url: fileUrl,
          original_filename: doc.originalname,
          file_size: doc.size,
          mime_type: doc.mimetype,
          value_text: requirements_text || null
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
    const userId = req.user ? req.user.id : 1; // Temporal: hardcoded user
    const { status } = req.query;

    const projects = await projectRepository.getByUserId(userId, status);

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
 * GET /api/projects/:id
 * Obtener proyecto específico con imágenes y documentos
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1; // Temporal: hardcoded user

    const project = await projectRepository.getById(id, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Obtener imágenes y documentos
    const images = await projectRepository.getProjectImages(id);
    const documents = await projectRepository.getProjectDocuments(id);

    res.json({
      success: true,
      project: {
        ...project,
        images,
        documents
      }
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
    const userId = req.user ? req.user.id : 1; // Temporal: hardcoded user
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

    // Validaciones básicas
    if (!title || !category_id || !goal_amount || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: title, category_id, goal_amount, end_date'
      });
    }

    // Actualizar proyecto
    const updatedProject = await projectRepository.update(id, userId, {
      title,
      summary,
      category_id: parseInt(category_id),
      description_json: description_json ? JSON.parse(description_json) : {},
      goal_amount: parseFloat(goal_amount),
      start_date,
      end_date,
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
  res.status(501).json({
    success: false,
    message: 'Funcionalidad no implementada aún'
  });
};

/**
 * POST /api/projects/:id/images
 * Upload adicional de imágenes (placeholder)
 */
exports.uploadProjectImages = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidad no implementada aún'
  });
};

/**
 * DELETE /api/projects/:id/images/:imageId
 * Eliminar imagen
 */
exports.deleteProjectImage = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidad no implementada aún'
  });
};

/**
 * DELETE /api/projects/:id
 * Soft delete de proyecto
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1; // Temporal: hardcoded user

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
