// Usar ruta relativa si no hay VITE_API_URL configurado (permite que Vite proxy funcione)
const API_URL = import.meta.env.VITE_API_URL || '';


// Gestión de tokens
let accessToken = null;
let isRefreshing = false;
let refreshPromise = null;

/**
 * Obtener token de acceso desde memoria
 */
export function getToken() {
  return accessToken || localStorage.getItem('accessToken');
}

/**
 * Establecer token de acceso en memoria y localStorage
 */
export function setToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
}

/**
 * Limpiar todos los tokens
 */
export function clearTokens() {
  accessToken = null;
  localStorage.removeItem('accessToken');
}

/**
 * Refrescar token de acceso usando cookie httpOnly de refresh token
 */
async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Enviar cookie httpOnly
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al refrescar el token');
  }

  const data = await response.json();
  return data.accessToken;
}

/**
 * Fetch mejorado con refresco automático de token
 * 
 * @param {string} path - Ruta del endpoint de la API
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<any>} Datos de respuesta
 */
export async function apiFetch(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // Incluir cookies para refresh token
    body: body ? JSON.stringify(body) : undefined
  });

  // Manejar 401 No autorizado - token expirado
  if (response.status === 401 && auth && retry) {
    const data = await response.clone().json().catch(() => ({}));

    // Verificar si es una expiración de token
    if (data.code === 'TOKEN_EXPIRED' || data.error?.includes('expirado')) {
      // Prevenir múltiples intentos de refresco simultáneos
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken()
          .then(newToken => {
            setToken(newToken);
            isRefreshing = false;
            return newToken;
          })
          .catch(err => {
            isRefreshing = false;
            clearTokens();
            // Redirigir al login
            window.location.href = '/login';
            throw err;
          });
      }

      // Esperar a que el refresco se complete
      await refreshPromise;

      // Reintentar solicitud original con nuevo token (retry = false para prevenir bucle infinito)
      return apiFetch(path, { method, body, auth, retry: false });
    }
  }

  // Parsear respuesta
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  // Manejar errores
  if (!response.ok) {
    const message = typeof data === 'object' && data?.error
      ? data.error
      : typeof data === 'object' && data?.message
        ? data.message
        : 'Error de API';

    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Login con email/contraseña
 */
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false
  });

  setToken(data.accessToken);
  return data.user;
}

/**
 * Registrar con email/contraseña
 */
export async function register(email, password, nombre) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: { email, password, nombre },
    auth: false
  });

  return data.user;
}

/**
 * Cerrar sesión
 */
export async function logout() {
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      auth: true
    });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    clearTokens();
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  return await apiFetch('/auth/me', {
    method: 'GET',
    auth: true
  });
}
