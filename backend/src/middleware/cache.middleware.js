const redisService = require('../services/redis.service');

/**
 * Generic cache middleware for Express routes
 * @param {string} cacheKeyPrefix - Prefix for the cache key (e.g., 'reports', 'reservas')
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {function} keyGenerator - Optional function to generate custom cache key from req
 */
function cacheMiddleware(cacheKeyPrefix, ttlSeconds, keyGenerator = null) {
    return async (req, res, next) => {
        // Generate cache key (default: prefix only, or custom from request)
        const cacheKey = keyGenerator
            ? `${cacheKeyPrefix}:${keyGenerator(req)}`
            : cacheKeyPrefix;

        try {
            // Try to get from cache
            const cachedData = await redisService.get(cacheKey);

            if (cachedData) {
                // Cache HIT - return immediately
                console.log(`🔵 Cache HIT: ${cacheKey}`);
                return res.json(cachedData);
            }

            // Cache MISS - intercept response to save to cache
            console.log(`🟡 Cache MISS: ${cacheKey}`);
            const originalJson = res.json.bind(res);

            res.json = function (data) {
                // Save to cache asynchronously (don't wait)
                redisService.set(cacheKey, data, ttlSeconds)
                    .then(() => {
                        console.log(`✅ Cached: ${cacheKey} (TTL: ${ttlSeconds}s)`);
                    })
                    .catch(err => {
                        console.error('Error saving to cache:', err);
                    });

                // Send response
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            // On error, skip cache and proceed normally
            next();
        }
    };
}

module.exports = { cacheMiddleware };
