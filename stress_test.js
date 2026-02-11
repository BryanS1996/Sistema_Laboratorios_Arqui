import http from 'k6/http';
import { check, sleep } from 'k6';

// --- CONFIGURACIÓN DEL ESCENARIO ---
export const options = {
    stages: [
        { duration: '10s', target: 20 }, // Subida
        { duration: '3m', target: 50 },  // <--- CAMBIA ESTO A '3m' (3 minutos)
        { duration: '10s', target: 0 },  // Bajada
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // El 95% debe responder en menos de 2s
        http_req_failed: ['rate<0.05'],    // Máximo 5% de error
    },
};

const BASE_URL = 'http://localhost:3000';
// 💡 Recuerda cambiar localhost por tu IP si usas 2 PCs.

// --- PASO 1: LOGIN ---
export function setup() {
    const loginPayload = JSON.stringify({
        email: 'admin-labs@uce.edu.ec',
        password: 'admin',
    });

    const params = { headers: { 'Content-Type': 'application/json' } };
    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);

    if (loginRes.status !== 200) {
        console.error(`❌ ERROR LOGIN: ${loginRes.status} - ${loginRes.body}`);
        throw new Error('Falló el login. Revisa el backend.');
    }

    // ✅ CORRECCIÓN CLAVE: Usamos 'accessToken' en lugar de 'token'
    return { token: loginRes.json('accessToken') };
}

// --- PASO 2: ATAQUE ---
export default function (data) {
    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    // Petición a la ruta de laboratorios
    const res = http.get(`${BASE_URL}/laboratorios`, params);

    // Si falla, mostramos por qué (solo la primera vez)
    if (res.status !== 200 && __ITER === 0) {
        console.error(`🔴 Error en /laboratorios: ${res.status} ${res.body}`);
    }

    // Validaciones
    check(res, {
        '✅ Status 200 (OK)': (r) => r.status === 200,
        '⚡ Tiempo < 2s': (r) => r.timings.duration < 2000,
    });

    sleep(1);
}