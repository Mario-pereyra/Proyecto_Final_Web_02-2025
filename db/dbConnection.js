require("dotenv").config();
const { Pool } = require("pg");

// Crear pool de conexión inmediatamente
const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "db_Impulsame",
  password: process.env.PG_PASSWORD || "master123",
  port: process.env.PG_PORT || 5432,
});

console.log("Pool de conexión a PostgreSQL creado");

// Exportar pool directamente
module.exports = pool;
