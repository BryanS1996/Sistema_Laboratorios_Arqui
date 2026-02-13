const { Pool } = require("pg");

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });

    // Manejar errores de conexión idle para que no tuesten el backend
    pool.on('error', (err) => {
      console.error('🔴 Unexpected error on idle client', err);
      // No salir del proceso
    });
  }
  return pool;
}

module.exports = { getPool };
