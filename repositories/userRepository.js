const dbConnection = require("../db/dbConnection");
const userRepository = require("../");

let connection = null;

const getConnection = async () => {
  connection = connection || (await dbConnection());
  return connection;
};
// const connection = getConnection();

//     const data= await connection.query('')

exports.getUsers = async () => {
  try {
    const connection = await getConnection();

    const query = `SELECT * FROM users`;
    const data = await connection.query(query);
    if (!data || !data.rows) {
      throw new Error("No se encontraron usuarios");
    }
    return data.rows;
  } catch (error) {
    throw new Error("Error al obtener los usuarios: " + error.message);
  }
};

exports.getByIdUser = async (userId) => {
  const connection = getConnection();
  const query = `SELECT * FROM users WHERE id = ?`;

  const data = await connection.query(query, [userId]);
  if (!data || !data.rows) {
    throw new Error("No se encontro el usuario con el ID proporcionado");
  }
  return data.rows[0];
};

exports.createUser = async (fullName, email, password) => {
  const connection = getConnection();
  const query = `INSERT INTO  users (fullname,email,password)
                 VALUES ($1,$2,$3)
                 RETURNING id,fullname,email,role,status ;
                 `;

  const data = await connection.query(query, [fullName, email, password]);
  return data;
};

exports.deleteUser = async (userId) => {
  const connection = getConnection();
  const query = `DELETE FROM users WHERE id = ?`;

  const data = await connection.query(query, [userId]);
  return data;
};
