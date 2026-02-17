import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del escenario de saturación
export const options = {
    stages: [
        { duration: '10s', target: 50 },  // Ramp-up más agresivo
        { duration: '2m', target: 100 },  // 100 usuarios concurrentes - ALTA CARGA
        { duration: '10s', target: 0 },   // Bajada
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // Con caché, debe ser SÚPER rápido
        http_req_failed: ['rate<0.05'],   // Máximo 5% de error
    },
};

const BASE_URL = 'http://localhost:3000';

// Setup: Login para obtener token
export function setup() {
    const loginPayload = JSON.stringify({
        email: 'admin-labs@uce.edu.ec',
        password: 'admin',
    });

    const params = { headers: { 'Content-Type': 'application/json' } };
    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);

    if (loginRes.status !== 200) {
        console.error(`❌ ERROR LOGIN: ${loginRes.status} - ${loginRes.body}`);
        throw new Error('Falló el login');
    }

    return { token: loginRes.json('accessToken') };
}

// Función principal: Ataque con polling
export default function (data) {
    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    // Alternamos entre los 2 endpoints con caché
    const endpoints = [
        '/reservas/mine',  // Caché: 5s, user-specific
        '/reports',        // Caché: 30s, global
    ];

    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const res = http.get(`${BASE_URL}${randomEndpoint}`, params);

    // Log de errores en primera iteración
    if (res.status !== 200 && __ITER === 0) {
        console.error(`🔴 Error en ${randomEndpoint}: ${res.status} - ${res.body}`);
    }

    // Validaciones
    check(res, {
        '✅ Status 200': (r) => r.status === 200,
        '⚡ Caché activa (< 100ms)': (r) => r.timings.duration < 100,
    });

    sleep(0.5); // Más requests/segundo
}