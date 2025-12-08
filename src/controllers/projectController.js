const projectService = require('../services/projectService');
const { deleteFile, deleteFileSync } = require('../utils/fileHelper');

// Helper para limpiar archivos subidos en caso de error
const cleanupFiles = (files) => {
  if (!files) return;
  const textFiles = Array.isArray(files) ? files : Object.values(files).flat();

  textFiles.forEach(file => {
    if (file && file.filename) {
      const basePath = (file.fieldname === 'cover_image' || file.fieldname === 'gallery_images' || file.fieldname === 'mainImage') ? 'uploads/img/' : 'uploads/files/';
      deleteFileSync(`${basePath}${file.filename}`);
    }
  });
};

/**
 * POST /api/projects
 * Crear proyecto completo con imágenes y documentos
 */
exports.createProject = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 101;

    if (!req.body.title || !req.body.category_id || !req.body.goal_amount) {
      cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: title, category_id, goal_amount'
      });
    }

    const result = await projectService.createProject(userId, req.body, req.files || {});

    res.status(201).json({
      success: true,
      message: req.body.approval_status === 'borrador' ? 'Proyecto guardado como borrador' : 'Proyecto enviado para revisión',
      projectId: result.id,
      project: result
    });

  } catch (error) {
    console.error('Error al crear proyecto:', error);
    cleanupFiles(req.files);
    res.status(500).json({
      success: false,
      message: 'Error al guardar el proyecto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/projects
 */
exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.query.userId ? parseInt(req.query.userId) : null);

    const queryParams = {
      status: req.query.status,
      category: req.query.category,
      orderBy: req.query.orderBy,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };

    const projects = await projectService.getAllProjects(userId, queryParams);

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
 */
exports.searchProjects = async (req, res) => {
  try {
    const { q, search, category, status, orderBy, limit, offset, maxGoal, minProgress, maxProgress } = req.query;

    let mappedOrderBy = 'recent';
    if (orderBy === 'mas_populares' || orderBy === 'popular') mappedOrderBy = 'popular';
    else if (orderBy === 'proximos_a_finalizar' || orderBy === 'closing_soon') mappedOrderBy = 'closing_soon';
    else if (orderBy === 'meta_mayor' || orderBy === 'high_goal') mappedOrderBy = 'high_goal';
    else if (orderBy === 'meta_menor' || orderBy === 'low_goal') mappedOrderBy = 'low_goal';
    else if (orderBy === 'mas_recientes' || orderBy === 'recent') mappedOrderBy = 'recent';

    const filters = {
      searchTerm: q || search,
      category: category,
      status,
      orderBy: mappedOrderBy,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0,
      maxGoal: maxGoal ? parseFloat(maxGoal) : null,
      minProgress: minProgress ? parseFloat(minProgress) : undefined,
      maxProgress: maxProgress ? parseFloat(maxProgress) : undefined
    };

    const results = await projectService.searchProjects(filters);

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
 * GET /api/projects/stats/global
 */
exports.getGlobalStats = async (req, res) => {
  try {
    const stats = await projectService.getGlobalStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas globales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

/**
 * GET /api/projects/:id
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : (req.query.userId ? parseInt(req.query.userId) : 101);

    const project = await projectService.getProjectById(id, userId);

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
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 101;

    const projectDTO = {
      id: id,
      ...req.body,
      category_id: req.body.category_id ? parseInt(req.body.category_id) : undefined
    };

    // Update simple sin archivos
    await projectService.saveProjectUnified(userId, projectDTO, [], []);

    res.json({
      success: true,
      message: 'Proyecto actualizado correctamente',
      projectId: id
    });

  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    const statusCode = error.message === "PROYECTO_NO_ENCONTRADO" ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message === "PROYECTO_NO_ENCONTRADO" ? 'Proyecto no encontrado' : 'Error al actualizar el proyecto'
    });
  }
};

/**
 * POST /api/projects/:id/submit
 */
exports.submitProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 101;

    const result = await projectService.submitProject(id, userId);

    res.json({
      success: true,
      message: 'Proyecto enviado para revisión exitosamente',
      project: result
    });

  } catch (error) {
    console.error('Error al enviar proyecto:', error);

    if (error.message === "PROYECTO_NO_ENCONTRADO") {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    if (error.message === "ESTADO_INVALIDO") {
      return res.status(400).json({ success: false, message: 'Estado inválido para enviar' });
    }
    if (error.message === "PROYECTO_INCOMPLETO") {
      return res.status(400).json({
        success: false,
        message: 'El proyecto está incompleto',
        errors: error.details
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al enviar proyecto para revisión'
    });
  }
};

/**
 * POST /api/projects/save
 * Endpoint unificado (RF-PROY-01)
 */
exports.saveProject = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : (req.body.userId ? parseInt(req.body.userId) : 101);

    const images = [];
    const requirements = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.fieldname === 'cover_image') {
          images.push({ image_path: file.filename, original_filename: file.originalname, is_cover: true });
        } else if (file.fieldname === 'gallery_images') {
          images.push({ image_path: file.filename, original_filename: file.originalname, is_cover: false });
        } else if (file.fieldname.startsWith('req_')) {
          const rId = parseInt(file.fieldname.split('_')[1]);
          if (!isNaN(rId)) {
            requirements.push({
              requirement_id: rId,
              file_path: file.filename,
              original_filename: file.originalname,
              mime_type: file.mimetype
            });
          }
        }
      }
    }

    const projectDTO = {
      id: req.body.id,
      ...req.body
    };

    const result = await projectService.saveProjectUnified(userId, projectDTO, images, requirements);

    return res.status(result.isUpdate ? 200 : 201).json({
      success: true,
      message: result.isUpdate ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente',
      projectId: result.projectId
    });

  } catch (error) {
    console.error('Error en saveProject:', error);
    cleanupFiles(req.files);

    const statusCode = error.message === "PROYECTO_NO_ENCONTRADO" ? 404 : 500;
    const message = error.message === "PROYECTO_NO_ENCONTRADO" ? "Proyecto no encontrado o no tienes permisos" : "Error al guardar el proyecto";

    return res.status(statusCode).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/projects/draft
 */
exports.saveDraft = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 101;
    const draftDTO = { ...req.body };
    const projectId = await projectService.saveDraft(userId, draftDTO);

    res.json({
      success: true,
      message: 'Borrador guardado correctamente',
      data: { project_id: projectId }
    });

  } catch (error) {
    console.error('Error al guardar borrador:', error);

    if (error.message === "PROYECTO_NO_ENCONTRADO") {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }

    res.status(500).json({
      success: false,
      message: 'Error al guardar el borrador'
    });
  }
};

/**
 * DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : 101;

    await projectService.deleteProject(id, userId);

    res.json({
      success: true,
      message: 'Proyecto eliminado correctamente'
    });
  } catch (error) {
    if (error.message === "PROYECTO_NO_ENCONTRADO") {
      return res.status(404).json({ success: false, message: 'Proyecto no encontrado' });
    }
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto'
    });
  }
};

/**
 * GET /api/projects/:projectId/donations
 */
exports.getProjectDonations = async (req, res) => {
  try {
    const donations = await projectService.getProjectDonations(req.params.projectId);
    res.json({ success: true, count: donations.length, donations });
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    res.status(500).json({ success: false, message: "Error al obtener donaciones" });
  }
};

exports.uploadProjectImages = async (req, res) => {
  try {
    if (!req.files || !req.files.images) return res.status(400).json({ message: 'No images' });
    const { id } = req.params;
    const saved = [];
    for (const f of req.files.images) {
      const img = await projectService.addImage(id, {
        filename: f.filename,
        originalname: f.originalname
      });
      saved.push(img);
    }
    res.json({ success: true, images: saved });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
};

exports.deleteProjectImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const imgData = await projectService.deleteImage(imageId, id);
    if (imgData && imgData.image_path) {
      // Cleanup fisico opcional, buena practica
      const fullPath = imgData.image_path.startsWith('uploads') ? imgData.image_path : `uploads/img/${imgData.image_path}`;
      deleteFile(fullPath);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
};

exports.updateProjectCover = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const { id } = req.params;
    const result = await projectService.updateCoverImage(id, { filename: req.file.filename, originalname: req.file.originalname });

    if (result.oldPath) {
      const oldFullPath = result.oldPath.startsWith('uploads') ? result.oldPath : `uploads/img/${result.oldPath}`;
      deleteFile(oldFullPath);
    }

    res.json({ success: true, message: "Portada actualizada", image: result.updated });
  } catch (e) {
    // Cleanup new if error
    deleteFileSync(`uploads/img/${req.file.filename}`);
    res.status(500).json({ message: 'Error' });
  }
};

exports.updateRequirementFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    const { id, requirementId } = req.params;
    const result = await projectService.updateRequirementFile(id, requirementId, {
      filename: req.file.filename, original_filename: req.file.originalname, mimetype: req.file.mimetype
    }, null); // Null user check in simple version? OR Repo handles?

    if (result.oldPath) {
      const oldFullPath = result.oldPath.startsWith('uploads') ? result.oldPath : `uploads/files/${result.oldPath}`;
      deleteFile(oldFullPath);
    }

    res.json({ success: true });
  } catch (e) {
    deleteFileSync(`uploads/files/${req.file.filename}`);
    res.status(500).json({ message: 'Error' });
  }
};
