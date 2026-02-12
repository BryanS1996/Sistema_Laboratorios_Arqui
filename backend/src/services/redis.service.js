const { createClient } = require('redis');

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    async connect() {
        if (this.isConnected) return;

        try {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            this.client.on('error', (err) => {
                console.error('❌ Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('✅ Redis connected');
                this.isConnected = true;
            });

            await this.client.connect();
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
            this.isConnected = false;
        }
    }

    async get(key) {
        if (!this.isConnected) return null;

        try {
            const value = await this.client.get(key);
            if (value) {
                console.log(`🔵 Cache HIT: ${key}`);
                return JSON.parse(value);
            }
            console.log(`🟡 Cache MISS: ${key}`);
            return null;
        } catch (error) {
            console.error(`Error getting key ${key}:`, error);
            return null;
        }
    }

    async set(key, value, ttlSeconds = null) {
        if (!this.isConnected) return false;

        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, serialized);
            } else {
                await this.client.set(key, serialized);
            }
            console.log(`✅ Cached: ${key} (TTL: ${ttlSeconds || 'infinite'}s)`);
            return true;
        } catch (error) {
            console.error(`Error setting key ${key}:`, error);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected) return false;

        try {
            await this.client.del(key);
            console.log(`🗑️  Deleted cache: ${key}`);
            return true;
        } catch (error) {
            console.error(`Error deleting key ${key}:`, error);
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

// Singleton instance
const redisService = new RedisService();

module.exports = redisService;
