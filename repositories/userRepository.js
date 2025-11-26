const { dbConnectiion } = require("../db/dbConnection");

let connection = null;

const getConnection = async () => {
  connection = connection || (await dbConnectiion());
  return connection;
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
