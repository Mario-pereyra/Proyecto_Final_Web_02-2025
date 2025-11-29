const categoryRepository = require("../repositories/categoryRepository");

/**
 * GET /api/categories - Obtener todas las categorías con conteo de proyectos
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryRepository.getAllCategoriesWithCount();
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error en getAllCategories:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las categorías",
      error: error.message,
    });
  }
};

/**
 * GET /api/categories/:id/requirements - Obtener requisitos de una categoría
 */
exports.getCategoryRequirements = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la categoría existe
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    const requirements = await categoryRepository.getCategoryRequirements(id);
    return res.status(200).json({
      success: true,
      data: {
        category,
        requirements,
      },
    });
  } catch (error) {
    console.error("Error en getCategoryRequirements:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener los requisitos de la categoría",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/categories - Crear nueva categoría (solo admin)
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validaciones
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "El nombre de la categoría es requerido",
      });
    }

    const newCategory = await categoryRepository.createCategory(name, description);
    return res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error en createCategory:", error);
    
    // Si es error de duplicado
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Ya existe una categoría con ese nombre",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear la categoría",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/categories/:id/requirements - Crear requisito para categoría (solo admin)
 */
exports.createRequirement = async (req, res) => {
  try {
    const { id: categoryId } = req.params;
    const { code, label, type, required, position, optionsJson, validationsJson } = req.body;

    // Validaciones
    if (!code || !label || !type) {
      return res.status(400).json({
        success: false,
        message: "Los campos code, label y type son requeridos",
      });
    }

    // Verificar que la categoría existe
    const category = await categoryRepository.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    const requirementData = {
      categoryId,
      code,
      label,
      type,
      required,
      position,
      optionsJson,
      validationsJson,
    };

    const newRequirement = await categoryRepository.createRequirement(requirementData);
    return res.status(201).json({
      success: true,
      message: "Requisito creado exitosamente",
      data: newRequirement,
    });
  } catch (error) {
    console.error("Error en createRequirement:", error);

    // Si es error de duplicado
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Ya existe un requisito activo con ese código para esta categoría",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error al crear el requisito",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/admin/requirements/:id - Actualizar requisito (solo admin)
 */
exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay datos para actualizar",
      });
    }

    const updatedRequirement = await categoryRepository.updateRequirement(id, updateData);
    
    if (!updatedRequirement) {
      return res.status(404).json({
        success: false,
        message: "Requisito no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Requisito actualizado exitosamente",
      data: updatedRequirement,
    });
  } catch (error) {
    console.error("Error en updateRequirement:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar el requisito",
      error: error.message,
    });
  }
};

