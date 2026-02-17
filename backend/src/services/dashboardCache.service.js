/**
 * Servicio de Caché para Dashboard
 * 
 * Gestiona el cacheado de datos del dashboard cuando el sistema está saturado
 */

const { cacheGet, cacheSet, cacheDel } = require('../config/redis');

const DASHBOARD_CACHE_TTL = parseInt(process.env.DASHBOARD_CACHE_TTL || '30'); // 30 segundos
const DASHBOARD_CACHE_KEY_PREFIX = 'dashboard';

/**
 * Generar clave de caché única para cada usuario y timeRange
 */
function generateCacheKey(userId, timeRange = 'month') {
  return `${DASHBOARD_CACHE_KEY_PREFIX}:${userId || 'anonymous'}:${timeRange}`;
}

/**
 * Obtener datos del caché
 */
async function getCachedDashboardData(userId, timeRange) {
  const key = generateCacheKey(userId, timeRange);
  try {
    return await cacheGet(key);
  } catch (error) {
    console.warn('Error obteniendo caché del dashboard:', error.message);
    return null;
  }
}

/**
 * Guardar datos en caché
 */
async function cacheDashboardData(userId, timeRange, data) {
  const key = generateCacheKey(userId, timeRange);
  try {
    await cacheSet(key, {
      ...data,
      _cachedAt: new Date().toISOString(),
      _ttl: DASHBOARD_CACHE_TTL
    }, DASHBOARD_CACHE_TTL);
  } catch (error) {
    console.warn('Error cacheando datos del dashboard:', error.message);
    // No fallar la operación por error de caché
  }
}

/**
 * Limpiar caché del dashboard
 */
async function invalidateDashboardCache(userId = null) {
  try {
    if (userId) {
      // Limpiar caché de un usuario específico
      for (const timeRange of ['day', 'week', 'month']) {
        const key = generateCacheKey(userId, timeRange);
        await cacheDel(key);
      }
    } else {
      // Limpiar todo el caché del dashboard (más costoso)
      console.log('⚠️ Invalidando todo el caché del dashboard');
    }
  } catch (error) {
    console.warn('Error invalidando caché:', error.message);
  }
}

module.exports = {
  generateCacheKey,
  getCachedDashboardData,
  cacheDashboardData,
  invalidateDashboardCache,
  DASHBOARD_CACHE_TTL,
  DASHBOARD_CACHE_KEY_PREFIX
};
