// Re-exportar funciones de autenticación desde api.js para compatibilidad hacia atrás
export {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  setToken,
  clearTokens
} from './api';

/**
 * Obtener usuario desde localStorage
 * Nota: Esto es un caché. La fuente real de verdad es el backend mediante getCurrentUser()
 */
export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Guardar usuario en caché de localStorage
 */
export function setUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}
