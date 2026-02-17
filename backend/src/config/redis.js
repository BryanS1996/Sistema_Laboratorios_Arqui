/**
 * Configuración de Redis
 * 
 * Se usa para caché de datos cuando el sistema está saturado
 * y para rate limiting distribuido
 */

let redis;

// Intentar usar redis, pero no es crítico si no está disponible
try {
  redis = require('redis');
} catch (e) {
  console.warn('⚠️ Redis no instalado. Usando caché en memoria como fallback');
  redis = null;
}

const IS_REDIS_AVAILABLE = redis !== null;

/**
 * Cliente Redis singleton
 */
let redisClient = null;

async function connectRedis() {
  if (!IS_REDIS_AVAILABLE) {
    console.log('📌 Redis deshabilitado - usando caché en memoria');
    return null;
  }

  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado');
    });

    return redisClient;
  } catch (error) {
    console.error('Error conectando a Redis:', error.message);
    return null;
  }
}

/**
 * Obtener cliente Redis
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Caché en memoria fallback (si Redis no está disponible)
 */
const memoryCache = new Map();

function getFromMemoryCache(key) {
  const item = memoryCache.get(key);
  if (!item) return null;
  
  // Verificar si expiró
  if (item.expiresAt && item.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  
  return item.value;
}

function setInMemoryCache(key, value, ttl = 60) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + (ttl * 1000)
  });
}

/**
 * Funciones de caché unificadas
 */
async function cacheSet(key, value, ttl = 60) {
  if (redisClient) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.warn('Error guardando en Redis, usando memoria:', error.message);
      setInMemoryCache(key, value, ttl);
    }
  } else {
    setInMemoryCache(key, value, ttl);
  }
}

async function cacheGet(key) {
  if (redisClient) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Error leyendo de Redis, usando memoria:', error.message);
      return getFromMemoryCache(key);
    }
  } else {
    return getFromMemoryCache(key);
  }
}

async function cacheDel(key) {
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.warn('Error borrando de Redis:', error.message);
      memoryCache.delete(key);
    }
  } else {
    memoryCache.delete(key);
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  cacheSet,
  cacheGet,
  cacheDel,
  IS_REDIS_AVAILABLE
};
