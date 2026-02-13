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

    /**
     * Push to a list and optionally trim it
     */
    async lPush(key, value, maxLength = null) {
        if (!this.isConnected) return false;

        try {
            const serialized = JSON.stringify(value);
            await this.client.lPush(key, serialized);

            if (maxLength) {
                await this.client.lTrim(key, 0, maxLength - 1);
            }
            return true;
        } catch (error) {
            console.error(`Error pushing to Redis list ${key}:`, error);
            return false;
        }
    }

    /**
     * Get range from a list
     */
    async lRange(key, start = 0, stop = -1) {
        if (!this.isConnected) return null;

        try {
            const results = await this.client.lRange(key, start, stop);
            return results.map(r => JSON.parse(r));
        } catch (error) {
            console.error(`Error getting Redis range ${key}:`, error);
            return null;
        }
    }

    /**
     * Publish a message to a channel
     */
    async publish(channel, message) {
        if (!this.isConnected) return false;

        try {
            const serialized = JSON.stringify(message);
            await this.client.publish(channel, serialized);
            return true;
        } catch (error) {
            console.error(`Error publishing to Redis channel ${channel}:`, error);
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
