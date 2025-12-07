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
    // Fallback: Si no hay req.user (sin auth middleware), permitir userId por query param (DEV ONLY)
    const userId = req.user ? req.user.id : (req.query.userId ? parseInt(req.query.userId) : null);

    if (userId) {
      const { status } = req.query;
      const projects = await projectRepository.getByUserId(userId, status);
      return res.json({
        success: true,
        count: projects.length,
        projects
      });
    }

    // Si no hay usuario identificado, devolver feed público
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
    const { q, search, category, status, orderBy, limit, offset, maxGoal, minProgress, maxProgress } = req.query;

    // Mapeo de ordenamiento Frontend -> Backend
    let mappedOrderBy = 'recent';
    if (orderBy === 'mas_populares' || orderBy === 'popular') mappedOrderBy = 'popular';
    else if (orderBy === 'proximos_a_finalizar' || orderBy === 'closing_soon') mappedOrderBy = 'closing_soon';
    else if (orderBy === 'meta_mayor' || orderBy === 'high_goal') mappedOrderBy = 'high_goal';
    else if (orderBy === 'meta_menor' || orderBy === 'low_goal') mappedOrderBy = 'low_goal';
    else if (orderBy === 'mas_recientes' || orderBy === 'recent') mappedOrderBy = 'recent';

    const filters = {
      searchTerm: q || search,
      category: category, // Pasar como string (nombre/slug)
      status,
      orderBy: mappedOrderBy,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
      maxGoal: maxGoal ? parseFloat(maxGoal) : null,
      minProgress: minProgress ? parseFloat(minProgress) : undefined,
      maxProgress: maxProgress ? parseFloat(maxProgress) : undefined
    };

    const results = await projectRepository.searchProjects(filters);

    res.json({
      success: true,
      count: results.length,
      data: results,
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

const { validateProjectCompleteness } = require('../utils/projectValidation');
const categoryRepository = require('../repositories/categoryRepository');

/**
 * POST /api/projects/:id/submit
 * Enviar proyecto para revisión
 */
exports.submitProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 1;

    // 1. Obtener proyecto completo
    const project = await projectRepository.getById(id, userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado o no tienes permisos'
      });
    }

    if (project.approval_status !== 'borrador' && project.approval_status !== 'observado') {
      return res.status(400).json({
        success: false,
        message: 'El proyecto no está en un estado válido para enviar (solo Borrador u Observado)'
      });
    }

    // 2. Obtener datos dependientes para validación
    const images = await projectRepository.getProjectImages(id);
    const answers = await projectRepository.getProjectDocuments(id);
    const requirements = await categoryRepository.getCategoryRequirements(project.category_id);

    // 3. Validar Integridad
    const validation = validateProjectCompleteness(project, images, requirements, answers);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'El proyecto está incompleto',
        errors: validation.errors
      });
    }

    // 4. Si pasa validación, cambiar estado
    const submittedProject = await projectRepository.submitForReview(id, userId);

    res.json({
      success: true,
      message: 'Proyecto enviado para revisión exitosamente',
      project: submittedProject
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
  try {
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
      // Borrar archivos si falla validación
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => deleteFileSync(`uploads/${file.fieldname === 'cover_image' ? 'img' : 'files'}/${file.filename}`));
      }
      return res.status(400).json({ success: false, message: 'El título es obligatorio' });
    }

    // Preparar datos para el repositorio
    const projectData = {
      owner_id: userId,
      category_id,
      title,
      short_description,
      story_json: typeof story_json === 'string' ? JSON.parse(story_json || '{}') : (story_json || {}),
      goal_amount: goal_amount ? parseFloat(goal_amount) : null,
      duration_days: duration_days ? parseInt(duration_days) : null,
      started_at: started_at || null,
      deadline_at: deadline_at || null,
      approval_status: 'borrador'
    };

    // Procesar imágenes y archivos para pasarlos limpios al repositorio
    const images = [];
    const requirements = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname === 'cover_image') {
          images.push({
            image_path: `uploads/img/${file.filename}`,
            original_filename: file.originalname,
            is_cover: true
          });
        }
        if (file.fieldname.startsWith('req_')) {
          const requirementId = parseInt(file.fieldname.split('_')[1]);
          requirements.push({
            requirement_id: requirementId,
            file_path: `uploads/files/${file.filename}`,
            original_filename: file.originalname,
            mime_type: file.mimetype
          });
        }
      }
    }

    let resultId;

    if (isUpdate) {
      resultId = await projectRepository.updateWithTransaction(projectId, userId, projectData, images, requirements);
    } else {
      resultId = await projectRepository.createWithTransaction(projectData, images, requirements);
    }

    return res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: isUpdate ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente',
      projectId: resultId
    });

  } catch (error) {
    console.error('Error en saveProject:', error);

    // Limpieza de archivos en caso de error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = file.fieldname === 'cover_image'
          ? `uploads/img/${file.filename}`
          : `uploads/files/${file.filename}`;
        deleteFileSync(filePath);
      });
    }

    const statusCode = error.message === "PROYECTO_NO_ENCONTRADO" ? 404 : 500;
    const message = error.message === "PROYECTO_NO_ENCONTRADO" ? "Proyecto no encontrado o no tienes permisos" : "Error al guardar el proyecto";

    return res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
