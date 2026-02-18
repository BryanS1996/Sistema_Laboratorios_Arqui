const { Pool } = require('pg');

let poolAppA;

/**
 * Conexión a PostgreSQL A (labdb) - MODO SOLO LECTURA
 * Para leer audit_logs generados por App A
 */
function getPoolAppA() {
    if (!poolAppA) {
        poolAppA = new Pool({
            host: process.env.PG_APPA_HOST,
            port: Number(process.env.PG_APPA_PORT),
            user: process.env.PG_APPA_USER,
            password: process.env.PG_APPA_PASSWORD,
            database: process.env.PG_APPA_DATABASE,
            max: 5, // Menos conexiones porque es solo lectura
        });

        poolAppA.on('error', (err) => {
            console.error('🔴 Unexpected error on idle PostgreSQL A (readonly) client', err);
        });

        console.log(`✅ Connected to PostgreSQL A (labdb) in readonly mode at ${process.env.PG_APPA_HOST}:${process.env.PG_APPA_PORT}`);
    }
    return poolAppA;
}

module.exports = { getPoolAppA };
