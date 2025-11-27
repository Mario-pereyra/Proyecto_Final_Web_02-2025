const { dbConnectiion } = require("../db/dbConnection");

let connection = null;

const getConnection = async () => {
  connection = connection || (await dbConnectiion());
  return connection;
};

/**
 * Obtener todas las categorías con el conteo de proyectos publicados
 * @returns {Promise<Array>} Lista de categorías con conteo de proyectos
 */
exports.getAllCategoriesWithCount = async () => {
  try {
    const connection = await getConnection();
    const query = `
      SELECT 
        c.id,
        c.name,
        c.description,
        COUNT(CASE 
          WHEN p.approval_status = 'publicado' AND p.deleted_at IS NULL 
          THEN 1 
        END) as project_count
      FROM categories c
      LEFT JOIN projects p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name ASC
    `;
    const data = await connection.query(query);
    return data.rows;
  } catch (error) {
    console.error("Error al obtener categorías con conteo:", error);
    throw error;
  }
};

/**
 * Obtener una categoría por ID
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Object>} Categoría encontrada
 */
exports.getCategoryById = async (categoryId) => {
  try {
    const connection = await getConnection();
    const query = `
      SELECT id, name, description
      FROM categories
      WHERE id = $1
    `;
    const data = await connection.query(query, [categoryId]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al obtener categoría por ID:", error);
    throw error;
  }
};

/**
 * Obtener requisitos de una categoría
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Array>} Lista de requisitos de la categoría
 */
exports.getCategoryRequirements = async (categoryId) => {
  try {
    const connection = await getConnection();
    const query = `
      SELECT 
        id,
        category_id,
        code,
        label,
        type,
        required,
        position,
        options_json,
        validations_json
      FROM category_requirements
      WHERE category_id = $1 
        AND is_active = TRUE 
        AND retired_at IS NULL
      ORDER BY position ASC
    `;
    const data = await connection.query(query, [categoryId]);
    return data.rows;
  } catch (error) {
    console.error("Error al obtener requisitos de categoría:", error);
    throw error;
  }
};

/**
 * Crear una nueva categoría (solo admin)
 * @param {string} name - Nombre de la categoría
 * @param {string} description - Descripción de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
exports.createCategory = async (name, description = null) => {
  try {
    const connection = await getConnection();
    const query = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING id, name, description
    `;
    const data = await connection.query(query, [name, description]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al crear categoría:", error);
    throw error;
  }
};

/**
 * Crear un nuevo requisito para una categoría (solo admin)
 * @param {Object} requirementData - Datos del requisito
 * @returns {Promise<Object>} Requisito creado
 */
exports.createRequirement = async (requirementData) => {
  try {
    const connection = await getConnection();
    const {
      categoryId,
      code,
      label,
      type,
      required = true,
      position = 1,
      optionsJson = null,
      validationsJson = null,
    } = requirementData;

    const query = `
      INSERT INTO category_requirements 
        (category_id, code, label, type, required, position, options_json, validations_json)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, category_id, code, label, type, required, position, options_json, validations_json
    `;
    const data = await connection.query(query, [
      categoryId,
      code,
      label,
      type,
      required,
      position,
      optionsJson,
      validationsJson,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al crear requisito:", error);
    throw error;
  }
};

/**
 * Actualizar un requisito (solo admin)
 * @param {number} requirementId - ID del requisito
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Requisito actualizado
 */
exports.updateRequirement = async (requirementId, updateData) => {
  try {
    const connection = await getConnection();
    const {
      label,
      type,
      required,
      position,
      optionsJson,
      validationsJson,
      isActive,
    } = updateData;

    const query = `
      UPDATE category_requirements
      SET 
        label = COALESCE($1, label),
        type = COALESCE($2, type),
        required = COALESCE($3, required),
        position = COALESCE($4, position),
        options_json = COALESCE($5, options_json),
        validations_json = COALESCE($6, validations_json),
        is_active = COALESCE($7, is_active)
      WHERE id = $8
      RETURNING id, category_id, code, label, type, required, position, options_json, validations_json, is_active
    `;
    const data = await connection.query(query, [
      label,
      type,
      required,
      position,
      optionsJson,
      validationsJson,
      isActive,
      requirementId,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al actualizar requisito:", error);
    throw error;
  }
};
