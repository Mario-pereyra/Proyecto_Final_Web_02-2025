const pool = require("../db/dbConnection");

const getConnection = () => {
  return pool;
};

exports.getUsers = async () => {
  try {
    const connection = await getConnection();
    const query = `SELECT id, full_name, email, role, status FROM users ORDER BY id`;
    const data = await connection.query(query);
    return data.rows;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

exports.getByIdUser = async (userId) => {
  try {
    const connection = await getConnection();
    const query = `SELECT id, full_name, email, role, status FROM users WHERE id = $1`;
    const data = await connection.query(query, [userId]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al obtener usuario por ID:", error);
    throw error;
  }
};

exports.createUser = async (fullName, email, password) => {
  try {
    const connection = await getConnection();
    const query = `INSERT INTO users (full_name, email, password)
                   VALUES ($1, $2, $3)
                   RETURNING id, full_name, email, role, status`;
    const data = await connection.query(query, [fullName, email, password]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

exports.createAdmin = async (fullName, email, password) => {
  try {
    const connection = await getConnection();
    const query = `INSERT INTO users (full_name, email, password, role, status)
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING id, full_name, email, role, status`;
    const data = await connection.query(query, [
      fullName,
      email,
      password,
      "admin",
      "activo",
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al crear administrador:", error);
    throw error;
  }
};

exports.deleteUser = async (userId) => {
  try {
    const connection = await getConnection();
    const query = `DELETE FROM users WHERE id = $1`;
    const data = await connection.query(query, [userId]);
    return data.rowCount > 0;
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};

exports.updateUser = async (userId, fullName, email, role, status) => {
  try {
    const connection = await getConnection();
    const query = `UPDATE users
                   SET full_name = $2, email = $3, role = $4, status = $5
                   WHERE id = $1
                   RETURNING id, full_name, email, role, status`;
    const data = await connection.query(query, [
      userId,
      fullName,
      email,
      role,
      status,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw error;
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const connection = await getConnection();
    const query = `SELECT id, full_name, email, password, role, status FROM users WHERE email = $1`;
    const data = await connection.query(query, [email]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al obtener usuario por email:", error);
    throw error;
  }
};

exports.getUserDonations = async (userId) => {
  try {
    const connection = await getConnection();
    const query = `SELECT 
                     d.id,
                     d.project_id,
                     d.amount,
                     d.created_at,
                     p.title as project_title,
                     c.name as category_name
                   FROM donations d
                   INNER JOIN projects p ON d.project_id = p.id
                   INNER JOIN categories c ON p.category_id = c.id
                   WHERE d.user_id = $1 
                     AND d.status = 'pagado'
                   ORDER BY d.created_at DESC`;
    const data = await connection.query(query, [userId]);
    return data.rows;
  } catch (error) {
    console.error("Error al obtener donaciones del usuario:", error);
    throw error;
  }
};

exports.getUserFavorites = async (userId) => {
  try {
    const connection = await getConnection();
    const query = `SELECT 
                     pdv.id,
                     pdv.title,
                     pdv.short_description,
                     pdv.goal_amount,
                     pdv.approval_status,
                     pdv.campaign_status,
                     pdv.created_at,
                     pdv.category_name,
                     pdv.owner_name,
                     sp.saved_at,
                     (
                       SELECT image_path 
                       FROM project_images 
                       WHERE project_id = pdv.id AND is_cover = true 
                       LIMIT 1
                     ) as cover_image
                   FROM saved_projects sp
                   INNER JOIN project_details_view pdv ON sp.project_id = pdv.id
                   WHERE sp.user_id = $1 
                     AND pdv.approval_status = 'publicado'
                   ORDER BY sp.saved_at DESC`;
    const data = await connection.query(query, [userId]);
    return data.rows;
  } catch (error) {
    console.error("Error al obtener favoritos del usuario:", error);
    throw error;
  }
};

exports.getUserKPIs = async (userId) => {
  try {
    const client = await getConnection();

    // Total de proyectos del usuario
    const projectsResult = await client.query(
      `SELECT COUNT(*) as total 
       FROM projects 
       WHERE owner_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    // Campañas activas (proyectos publicados en progreso)
    const activeCampaignsResult = await client.query(
      `SELECT COUNT(*) as total 
       FROM projects 
       WHERE owner_id = $1 
         AND approval_status = 'publicado' 
         AND campaign_status = 'en_progreso'
         AND deleted_at IS NULL`,
      [userId]
    );

    // Total recaudado (suma de donaciones a proyectos del usuario)
    const totalRaisedResult = await client.query(
      `SELECT COALESCE(SUM(d.amount), 0) as total
       FROM donations d
       INNER JOIN projects p ON d.project_id = p.id
       WHERE p.owner_id = $1 
         AND d.status = 'pagado'
         AND p.deleted_at IS NULL`,
      [userId]
    );

    // Total donado (suma de donaciones hechas por el usuario)
    const totalDonatedResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM donations
       WHERE user_id = $1 
         AND status = 'pagado'`,
      [userId]
    );

    return {
      totalProjects: parseInt(projectsResult.rows[0].total),
      activeCampaigns: parseInt(activeCampaignsResult.rows[0].total),
      totalRaised: parseFloat(totalRaisedResult.rows[0].total),
      totalDonated: parseFloat(totalDonatedResult.rows[0].total)
    };
  } catch (error) {
    console.error("Error al obtener KPIs del usuario:", error);
    throw error;
  }
};
