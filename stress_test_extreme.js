import http from 'k6/http';
import { check, sleep } from 'k6';

// 🔥 CONFIGURACIÓN EXTREMA - SATURACIÓN TOTAL
export const options = {
    stages: [
        { duration: '20s', target: 100 },   // Warm-up
        { duration: '30s', target: 200 },   // Escalada rápida
        { duration: '5m', target: 300 },    // 🔥 300 USUARIOS - SATURACIÓN
        { duration: '20s', target: 0 },     // Cool-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],  // Más permisivo (esperamos degradación)
        http_req_failed: ['rate<0.15'],     // Permitir hasta 15% de errores
    },
};

const BASE_URL = 'http://localhost:3000';

// Setup: Login
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

// 🔥 ATAQUE EXTREMO
export default function (data) {
    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    // Alternamos entre endpoints cacheados
    const endpoints = [
        '/reservas/mine',
        '/reports',
    ];

    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const res = http.get(`${BASE_URL}${randomEndpoint}`, params);

    // Log errores (solo primeras 5 iteraciones para no saturar logs)
    if (res.status !== 200 && __ITER < 5) {
        console.error(`🔴 Error en ${randomEndpoint}: ${res.status}`);
    }

    // Validaciones
    check(res, {
        '✅ Status 200': (r) => r.status === 200,
        '⚡ Response < 2s': (r) => r.timings.duration < 2000,
        '🚀 Caché activo < 200ms': (r) => r.timings.duration < 200,
    });

    // 🔥 SLEEP MUY CORTO - MÁS PRESIÓN
    sleep(0.1); // 10 requests/segundo por usuario
}

// Reporte al final
export function teardown(data) {
    console.log('🏁 Test de saturación completado');
}
