const redis = require('redis');

let redisClient;

/**
 * Obtiene el cliente de Redis (compartido con App A)
 */
async function getRedisClient() {
    if (!redisClient) {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });

        redisClient.on('error', (err) => {
            console.error('🔴 Redis Client Error:', err);
        });

        await redisClient.connect();
        console.log('✅ Connected to Redis:', process.env.REDIS_URL);
    }

    return redisClient;
}

module.exports = { getRedisClient };
