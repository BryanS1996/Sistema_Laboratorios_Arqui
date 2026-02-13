/**
 * Middleware de Rate Limiting y Control de Saturación
 * 
 * Controla el número de peticiones concurrentes al servidor
 * y sirve datos cacheados cuando el sistema está saturado
 */

const { cacheGet, cacheSet } = require('../config/redis');

// Contador simple de peticiones en progreso
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '100');
const SATURATION_THRESHOLD = parseInt(process.env.SATURATION_THRESHOLD || '80'); // 80% de MAX

/**
 * Estado del sistema
 */
let systemStatus = {
  isHealthy: true,
  activeRequests: 0,
  peakRequests: 0,
  totalRequests: 0,
  saturatedSince: null,
  uptime: Date.now()
};

/**
 * Obtener estado del sistema
 */
function getSystemStatus() {
  return {
    ...systemStatus,
    activeRequests,
    utilizationPercent: Math.round((activeRequests / MAX_CONCURRENT_REQUESTS) * 100),
    isSaturated: activeRequests >= (MAX_CONCURRENT_REQUESTS * SATURATION_THRESHOLD / 100)
  };
}

/**
 * Middleware de rate limiting
 */
function rateLimitMiddleware(req, res, next) {
  // Obtener estado actual
  const utilizationPercent = (activeRequests / MAX_CONCURRENT_REQUESTS) * 100;
  const isSaturated = activeRequests >= (MAX_CONCURRENT_REQUESTS * SATURATION_THRESHOLD / 100);

  // Agregar información de limitación al request
  req.systemStatus = getSystemStatus();
  req.rateLimitInfo = {
    activeRequests,
    maxRequests: MAX_CONCURRENT_REQUESTS,
    utilization: utilizationPercent,
    isSaturated
  };

  // Si está saturado y es una petición de lectura (GET), rechazar con código 429
  if (isSaturated && req.method === 'GET') {
    return res.status(429).json({
      error: 'Servidor saturado',
      message: 'El servidor está procesando muchas peticiones. Por favor intenta más tarde.',
      retryAfter: 5,
      systemStatus: getSystemStatus()
    });
  }

  // Si excede el máximo, rechazar
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: 'El servidor ha alcanzado su capacidad máxima',
      retryAfter: 10,
      systemStatus: getSystemStatus()
    });
  }

  // Incrementar contador
  activeRequests++;
  systemStatus.totalRequests++;
  systemStatus.activeRequests = activeRequests;
  if (activeRequests > systemStatus.peakRequests) {
    systemStatus.peakRequests = activeRequests;
  }

  // Actualizar estado de saturación
  if (isSaturated && !systemStatus.saturatedSince) {
    systemStatus.saturatedSince = new Date().toISOString();
    console.warn(`⚠️ Sistema saturado: ${activeRequests}/${MAX_CONCURRENT_REQUESTS} peticiones activas`);
  } else if (!isSaturated && systemStatus.saturatedSince) {
    console.log(`✅ Sistema recuperado después de saturación`);
    systemStatus.saturatedSince = null;
  }

  // Limpiar el contador cuando se complete la petición
  res.on('finish', () => {
    activeRequests--;
    systemStatus.activeRequests = activeRequests;
  });

  next();
}

/**
 * Middleware para servir datos cacheados cuando está saturado
 * Usar en endpoints específicos (como dashboard)
 */
function serveFromCacheIfSaturatedMiddleware(cacheKeyPrefix) {
  return async (req, res, next) => {
    const status = getSystemStatus();
    
    // Si está saturado y hay caché, servir desde caché
    if (status.isSaturated && req.method === 'GET') {
      const cacheKey = `${cacheKeyPrefix}:${req.user?.id || 'anonymous'}:${JSON.stringify(req.query)}`;
      try {
        const cachedData = await cacheGet(cacheKey);
        if (cachedData) {
          console.log(`📦 Sirviendo desde caché (saturación): ${cacheKey}`);
          return res.json({
            ...cachedData,
            servedFromCache: true,
            cacheTimestamp: new Date(cachedData._cacheTime).toISOString(),
            systemStatus: status
          });
        }
      } catch (error) {
        console.error('Error leyendo caché:', error.message);
        // Continuar sin caché
      }
    }

    next();
  };
}

/**
 * Guardar datos en caché después de procesar la petición
 */
async function cacheResponse(cacheKey, data, ttl = 60) {
  try {
    await cacheSet(cacheKey, {
      ...data,
      _cacheTime: Date.now()
    }, ttl);
  } catch (error) {
    console.warn('Error cacheando respuesta:', error.message);
    // No fallar la petición por error de caché
  }
}

module.exports = {
  rateLimitMiddleware,
  serveFromCacheIfSaturatedMiddleware,
  cacheResponse,
  getSystemStatus,
  MAX_CONCURRENT_REQUESTS,
  SATURATION_THRESHOLD
};
