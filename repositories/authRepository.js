const { dbConnectiion } = require("../db/dbConnection");

let connection = null;

const getConnection = async () => {
  connection = connection || (await dbConnectiion());
  return connection;
};

// Guardar token de verificación
exports.saveVerificationToken = async (userId, token, expiresIn = 900) => {
  try {
    const connection = await getConnection();
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const query = `INSERT INTO user_tokens (user_id, purpose, code, expires_at)
                   VALUES ($1, 'verificacion_email', $2, $3)
                   RETURNING id, user_id, code, expires_at`;
    const data = await connection.query(query, [userId, token, expiresAt]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al guardar token de verificación:", error);
    throw error;
  }
};

// Verificar token
exports.verifyToken = async (token) => {
  try {
    const connection = await getConnection();
    const query = `SELECT ut.*, u.email, u.full_name 
                   FROM user_tokens ut
                   JOIN users u ON ut.user_id = u.id
                   WHERE ut.code = $1 AND ut.expires_at > NOW() AND ut.used_at IS NULL
                   AND ut.purpose = 'verificacion_email'
                   ORDER BY ut.created_at DESC
                   LIMIT 1`;
    const data = await connection.query(query, [token]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al verificar token:", error);
    throw error;
  }
};

// Marcar token como usado
exports.markTokenAsUsed = async (tokenId) => {
  try {
    const connection = await getConnection();
    const query = `UPDATE user_tokens 
                   SET used_at = NOW()
                   WHERE id = $1`;
    const data = await connection.query(query, [tokenId]);
    return data.rowCount > 0;
  } catch (error) {
    console.error("Error al marcar token como usado:", error);
    throw error;
  }
};

// Invalidar tokens anteriores de un usuario
exports.invalidateUserTokens = async (userId) => {
  try {
    const connection = await getConnection();
    const query = `UPDATE user_tokens 
                   SET used_at = NOW()
                   WHERE user_id = $1 AND used_at IS NULL AND purpose = 'verificacion_email'`;
    const data = await connection.query(query, [userId]);
    return data.rowCount;
  } catch (error) {
    console.error("Error al invalidar tokens del usuario:", error);
    throw error;
  }
};

// Activar usuario
exports.activateUser = async (userId) => {
  try {
    const connection = await getConnection();
    const query = `UPDATE users 
                   SET status = 'activo'
                   WHERE id = $1
                   RETURNING id, full_name, email, role, status`;
    const data = await connection.query(query, [userId]);
    return data.rows[0];
  } catch (error) {
    console.error("Error al activar usuario:", error);
    throw error;
  }
};
