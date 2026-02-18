const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Validar token SSO desde App A
 * Este es el endpoint CRÍTICO para el flujo SSO
 */
export async function validateSSOToken(token) {
    const response = await fetch(`${API_URL}/api/logs/sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, limit: 100 })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Token SSO inválido');
    }

    const data = await response.json();
    return data; // { success, logs, user, ssoMode }
}

/**
 * Login con Google OAuth (directo en App B)
 */
export async function googleLogin(idToken) {
    const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Error en login');
    }

    return response.json(); // { success, user, token }
}

/**
 * Obtener logs recientes (auth tradicional)
 */
export async function getRecentLogs(token, limit = 100) {
    const response = await fetch(`${API_URL}/api/logs/recent?limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Error obteniendo logs');
    }

    return response.json();
}
