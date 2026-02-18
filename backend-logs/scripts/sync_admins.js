const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Importar pool de App B desde configuración del proyecto
const { getPoolAppB } = require('../src/config/postgres-appb');

async function syncAdmins() {
    console.log('🔄 Iniciando sincronización de administradores...');

    // Conexión a DB Principal (App A)
    // App A no tiene config file en este proyecto (backend-logs), así que mantenemos manual
    const poolA = new Pool({
        host: process.env.PG_APPA_HOST || 'localhost',
        port: process.env.PG_APPA_PORT || 5432,
        user: process.env.PG_APPA_USER || 'lab',
        password: process.env.PG_APPA_PASSWORD || 'lab',
        database: process.env.PG_APPA_DATABASE || 'labdb'
    });

    // Conexión a DB Logs (App B) usando config nativa
    const poolB = getPoolAppB();

    try {
        const { rows: context } = await poolB.query('SELECT current_user, current_database(), current_schema()');
        console.log('🔍 App B Context:', context[0]);

        // 1. Obtener admins de App A
        console.log('📥 Obteniendo admins desde App A (labdb)...');
        const { rows: adminsA } = await poolA.query(
            "SELECT email, password_hash, nombre, role, google_id FROM users WHERE role = 'admin'"
        );
        console.log(`✅ Encontrados ${adminsA.length} administradores en App A.`);

        // 2. Insertar/Actualizar en App B
        console.log('📤 Sincronizando hacia App B (logsdb)...');
        let syncedCount = 0;

        for (const admin of adminsA) {
            // Upsert basado en email
            await poolB.query(
                `INSERT INTO public.users (email, nombre, role, google_id, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           role = EXCLUDED.role,
           google_id = EXCLUDED.google_id,
           password_hash = EXCLUDED.password_hash,
           last_login = NOW()`,
                [admin.email, admin.nombre, 'admin', admin.google_id || admin.email, admin.password_hash]
            );
            syncedCount++;
        }

        console.log(`🎉 Sincronización completada! ${syncedCount} admins actualizados en App B.`);

    } catch (error) {
        console.error('❌ Error durante la sincronización:', error);
    } finally {
        await poolA.end();
        await poolB.end();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    syncAdmins();
}

module.exports = syncAdmins;
