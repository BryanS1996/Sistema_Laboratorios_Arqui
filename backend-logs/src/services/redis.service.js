const { getRedisClient } = require('../config/redis');

/**
 * Servicio de Redis para backend-logs
 */
class RedisService {
    /**
     * Obtener rango de lista (para logs)
     */
    async lRange(key, start, stop) {
        try {
            const client = await getRedisClient();
            const values = await client.lRange(key, start, stop);

            // Parse JSON de cada elemento
            return values.map(v => {
                try {
                    return JSON.parse(v);
                } catch {
                    return v;
                }
            });
        } catch (error) {
            console.error('Redis lRange error:', error.message);
            return [];
        }
    }
}

module.exports = new RedisService();
