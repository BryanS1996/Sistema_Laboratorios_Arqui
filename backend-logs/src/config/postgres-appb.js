const { Pool } = require('pg');

let poolAppB;

/**
 * Conexión a PostgreSQL B (logsdb)
 * Base de datos propia de App B para usuarios
 */
function getPoolAppB() {
    if (!poolAppB) {
        poolAppB = new Pool({
            host: process.env.PG_APPB_HOST,
            port: Number(process.env.PG_APPB_PORT),
            user: process.env.PG_APPB_USER,
            password: process.env.PG_APPB_PASSWORD,
            database: process.env.PG_APPB_DATABASE,
        });

        poolAppB.on('error', (err) => {
            console.error('🔴 Unexpected error on idle PostgreSQL B client', err);
        });

        console.log(`✅ Connected to PostgreSQL B (logsdb) at ${process.env.PG_APPB_HOST}:${process.env.PG_APPB_PORT}`);
    }
    return poolAppB;
}

module.exports = { getPoolAppB };
