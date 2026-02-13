import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Test de Saturación de Logs: Aplicación B
 * 
 * Genera TODOS los tipos de logs de auditoría:
 * - LOGIN, CREATE_RESERVA, UPDATE_RESERVA, DELETE_RESERVA
 * 
 * Estrategia:
 * 1. Setup consulta labs disponibles
 * 2. VUs crean reservas con labs reales
 * 3. VUs actualizan/eliminan las reservas creadas
 * 4. Dashboard readers leen logs constantemente
 */

export const options = {
    scenarios: {
        // Escenario 1: Generadores de logs (60%)
        log_generators: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 30 },    // Warm-up suave
                { duration: '2m', target: 60 },     // Carga media
                { duration: '1m', target: 90 },     // Saturación
                { duration: '30s', target: 0 },     // Cool-down
            ],
            exec: 'generateLogs',
        },

        // Escenario 2: Lectores del dashboard (40%)
        dashboard_readers: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '20s', target: 20 },    // Warm-up
                { duration: '2m', target: 40 },     // Carga media
                { duration: '1m', target: 60 },     // Saturación
                { duration: '30s', target: 0 },     // Cool-down
            ],
            exec: 'readDashboard',
        },
    },

    thresholds: {
        'http_req_duration{scenario:log_generators}': ['p(95)<3000'],  // Escritura DB puede ser lenta
        'http_req_failed{scenario:log_generators}': ['rate<0.30'],      // 30% error aceptable
        'http_req_duration{scenario:dashboard_readers}': ['p(95)<300'], // Lectura Redis rápida
        'http_req_failed{scenario:dashboard_readers}': ['rate<0.05'],   // Dashboard debe funcionar
        'http_req_duration': ['p(95)<2000'],
    },
};

const BASE_URL = 'http://localhost:3000';

// Setup: Obtener token y consultar labs disponibles
export function setup() {
    console.log('🔐 Setup: Obteniendo token y labs...');

    // Login de admin
    const adminLogin = JSON.stringify({
        email: 'admin-labs@uce.edu.ec',
        password: 'admin',
    });

    const params = { headers: { 'Content-Type': 'application/json' } };
    const loginRes = http.post(`${BASE_URL}/auth/login`, adminLogin, params);

    if (loginRes.status !== 200) {
        console.error(`❌ Login fallido: ${loginRes.status}`);
        throw new Error('Setup failed: no admin token');
    }

    const adminToken = loginRes.json('accessToken');
    console.log('✅ Token obtenido');

    // Consultar labs disponibles
    const labsRes = http.get(`${BASE_URL}/laboratorios`, {
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
        },
    });

    let labIds = [];
    if (labsRes.status === 200) {
        try {
            const labs = JSON.parse(labsRes.body);
            labIds = labs.map(lab => lab._id || lab.id).filter(id => id);
            console.log(`✅ ${labIds.length} labs encontrados`);
        } catch (e) {
            console.warn('⚠️ No se pudieron parsear labs, usando IDs genéricos');
        }
    }

    // Si no hay labs, usar IDs dummy (el POST fallará pero generará tráfico)
    if (labIds.length === 0) {
        console.warn('⚠️ No hay labs, test se enfocará en LOGINs');
        labIds = [null]; // Marcador para indicar que no hay labs
    }

    console.log('🚀 Setup completo, iniciando test...');
    return { adminToken, labIds };
}

/**
 * Escenario 1: Generadores de Logs Variados
 */
export function generateLogs(data) {
    const params = {
        headers: {
            'Authorization': `Bearer ${data.adminToken}`,
            'Content-Type': 'application/json',
        },
        tags: { scenario: 'log_generators' },
    };

    // Distribuir acciones: 40% login, 60% operaciones de reservas
    const action = Math.random();

    if (action < 0.40 || data.labIds[0] === null) {
        // Acción: LOGIN (genera log LOGIN)
        const loginPayload = JSON.stringify({
            email: 'admin-labs@uce.edu.ec',
            password: 'admin',
        });

        const res = http.post(`${BASE_URL}/auth/login`, loginPayload, {
            headers: { 'Content-Type': 'application/json' },
            tags: { action: 'login' },
        });

        check(res, { '🔐 Login': (r) => r.status === 200 });

    } else {
        // Acción: CRUD de Reserva
        const labId = data.labIds[Math.floor(Math.random() * data.labIds.length)];

        // 1. CREATE (genera log CREATE_RESERVA)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + Math.floor(Math.random() * 30) + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];

        const hour = 8 + Math.floor(Math.random() * 10); // 8-17
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;

        const createPayload = JSON.stringify({
            laboratorio: labId,
            fecha: dateStr,
            horaInicio: startTime,
            horaFin: endTime,
            motivo: `k6 test - VU${__VU} iter${__ITER}`,
            actividad: 'test de carga'
        });

        const createRes = http.post(`${BASE_URL}/reservas`, createPayload, {
            ...params,
            tags: { action: 'create_reservation' },
        });

        const created = check(createRes, {
            '📝 Reserva creada': (r) => r.status === 201,
        });

        // Si se creó exitosamente, intentar UPDATE o DELETE
        // Si se creó exitosamente, intentar UPDATE o DELETE
        if (created) {
            const reserva = JSON.parse(createRes.body);
            const reservaId = reserva._id || reserva.id;

            // Pausa corta
            sleep(0.5);

            // Decidir acción siguiente: 50% UPDATE, 50% DELETE
            if (reservaId && Math.random() < 0.5) {
                // DELETE (genera log DELETE_RESERVA)
                const deleteRes = http.del(`${BASE_URL}/reservas/${reservaId}`, {
                    ...params,
                    tags: { action: 'delete_reservation' },
                });

                check(deleteRes, { '🗑️ Reserva eliminada': (r) => r.status === 200 });
            } else {
                // UPDATE (genera log UPDATE_RESERVA)
                const updatePayload = JSON.stringify({
                    motivo: `ACTUALIZADO por VU${__VU}`,
                    horaInicio: endTime, // Cambiar horario
                    horaFin: `${(hour + 3).toString().padStart(2, '0')}:00`,
                });

                const updateRes = http.put(`${BASE_URL}/reservas/${reservaId}`, updatePayload, {
                    ...params,
                    tags: { action: 'update_reservation' },
                });

                check(updateRes, { '✏️ Reserva actualizada': (r) => r.status === 200 });
            }
        }
    }

    // Log de progreso cada 50 iteraciones
    if (__ITER % 50 === 0) {
        console.log(`[VU ${__VU}] ✅ ${__ITER} acciones completadas`);
    }

    // Pausa entre acciones
    sleep(Math.random() * 2 + 1); // 1-3 segundos
}

/**
 * Escenario 2: Lectores del Dashboard
 */
export function readDashboard(data) {
    const params = {
        headers: {
            'Authorization': `Bearer ${data.adminToken}`,
            'Content-Type': 'application/json',
        },
        tags: { scenario: 'dashboard_readers' },
    };

    // GET /api/logs/recent
    const logsRes = http.get(`${BASE_URL}/api/logs/recent?limit=100`, params);

    check(logsRes, {
        '✅ Dashboard OK': (r) => r.status === 200,
        '⚡ Rápido < 300ms': (r) => r.timings.duration < 300,
        '📊 Tiene logs': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.logs && body.logs.length > 0;
            } catch (e) {
                return false;
            }
        },
    });

    // Log ocasional
    if (__ITER % 20 === 0) {
        const latency = Math.round(logsRes.timings.duration);
        let logsCount = 0;
        try {
            logsCount = JSON.parse(logsRes.body).logs.length;
        } catch (e) { }
        console.log(`📊 [VU ${__VU}] Dashboard: ${logsRes.status} | ${latency}ms | ${logsCount} logs`);
    }

    sleep(5); // Polling cada 5 segundos
}

// Reporte final
export function teardown(data) {
    console.log('━'.repeat(80));
    console.log('🏁 TEST COMPLETADO - APLICACIÓN B');
    console.log('━'.repeat(80)); console.log('');
    console.log('📊 VERIFICAR VARIEDAD DE LOGS GENERADOS:');
    console.log('');
    console.log('docker exec gestor_lab_postgres psql -U lab -d labdb -c \\');
    console.log('  "SELECT action, COUNT(*) as total FROM audit_logs \\');
    console.log('   WHERE created_at > NOW() - INTERVAL \'5 minutes\' \\');
    console.log('   GROUP BY action ORDER BY total DESC;"');
    console.log('');
    console.log('📈 TIPOS ESPERADOS:');
    console.log('   • LOGIN (máximo)');
    console.log('   • CREATE_RESERVA (medio)');
    console.log('   • UPDATE_RESERVA (bajo)');
    console.log('   • DELETE_RESERVA (bajo)');
    console.log('');
    console.log('🌐 Ver dashboard: http://localhost:5173/admin/logs');
    console.log('━'.repeat(80));
}
