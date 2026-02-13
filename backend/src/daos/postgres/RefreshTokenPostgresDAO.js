const { getPool } = require('../../config/postgres');

class RefreshTokenPostgresDAO {
    /**
     * Create a new refresh token
     */
    async create(userId, token, expiresAt, deviceInfo = null, ipAddress = null) {
        const pool = getPool();

        const { rows } = await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at, device_info, ip_address)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, user_id, token, expires_at, device_info, ip_address, created_at`,
            [userId, token, expiresAt, deviceInfo, ipAddress]
        );

        return {
            id: rows[0].id,
            userId: rows[0].user_id,
            token: rows[0].token,
            expiresAt: rows[0].expires_at,
            deviceInfo: rows[0].device_info,
            ipAddress: rows[0].ip_address,
            createdAt: rows[0].created_at
        };
    }

    /**
     * Find a refresh token by token string
     */
    async findByToken(token) {
        const pool = getPool();

        const { rows } = await pool.query(
            `SELECT id, user_id, token, expires_at, device_info, ip_address, created_at
             FROM refresh_tokens
             WHERE token = $1
             LIMIT 1`,
            [token]
        );

        if (rows.length === 0) return null;

        return {
            id: rows[0].id,
            userId: rows[0].user_id,
            token: rows[0].token,
            expiresAt: rows[0].expires_at,
            deviceInfo: rows[0].device_info,
            ipAddress: rows[0].ip_address,
            createdAt: rows[0].created_at
        };
    }

    /**
     * Delete a refresh token by token string
     */
    async deleteByToken(token) {
        const pool = getPool();

        const result = await pool.query(
            `DELETE FROM refresh_tokens WHERE token = $1`,
            [token]
        );

        return result.rowCount > 0;
    }

    /**
     * Delete all refresh tokens for a user (logout all sessions)
     */
    async deleteByUserId(userId) {
        const pool = getPool();

        const result = await pool.query(
            `DELETE FROM refresh_tokens WHERE user_id = $1`,
            [userId]
        );

        return result.rowCount;
    }

    /**
     * Delete expired tokens (cleanup task)
     */
    async deleteExpired() {
        const pool = getPool();

        const result = await pool.query(
            `DELETE FROM refresh_tokens WHERE expires_at < NOW()`
        );

        return result.rowCount;
    }

    /**
     * Get all refresh tokens for a user
     */
    async findByUserId(userId) {
        const pool = getPool();

        const { rows } = await pool.query(
            `SELECT id, user_id, token, expires_at, device_info, ip_address, created_at
             FROM refresh_tokens
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            token: row.token,
            expiresAt: row.expires_at,
            deviceInfo: row.device_info,
            ipAddress: row.ip_address,
            createdAt: row.created_at
        }));
    }
}

module.exports = new RefreshTokenPostgresDAO();
