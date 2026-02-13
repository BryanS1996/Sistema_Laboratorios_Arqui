const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const RefreshTokenDAO = require('../daos/postgres/RefreshTokenPostgresDAO');

class RefreshTokenService {
    /**
     * Generate a new refresh token for a user
     */
    async generateRefreshToken(userId, deviceInfo = null, ipAddress = null) {
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await RefreshTokenDAO.create(userId, token, expiresAt, deviceInfo, ipAddress);
        return token;
    }

    /**
     * Verify and get refresh token
     */
    async verifyRefreshToken(token) {
        const refreshToken = await RefreshTokenDAO.findByToken(token);

        if (!refreshToken) {
            throw new Error('Invalid refresh token');
        }

        // Check if token is expired
        if (new Date() > new Date(refreshToken.expiresAt)) {
            await RefreshTokenDAO.deleteByToken(token);
            throw new Error('Refresh token expired');
        }

        return refreshToken;
    }

    /**
     * Generate new access token from refresh token
     */
    async refreshAccessToken(refreshToken) {
        const tokenData = await this.verifyRefreshToken(refreshToken);

        // Generate new access token
        const accessToken = jwt.sign(
            { id: tokenData.userId, type: 'access' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
        );

        return {
            accessToken,
            userId: tokenData.userId
        };
    }

    /**
     * Revoke refresh token (logout)
     */
    async revokeRefreshToken(token) {
        await RefreshTokenDAO.deleteByToken(token);
    }

    /**
     * Revoke all refresh tokens for a user (logout all sessions)
     */
    async revokeAllUserTokens(userId) {
        await RefreshTokenDAO.deleteByUserId(userId);
    }

    /**
     * Cleanup expired tokens (run as a cron job)
     */
    async cleanupExpiredTokens() {
        const deleted = await RefreshTokenDAO.deleteExpired();
        console.log(`🧹 Cleaned up ${deleted} expired refresh tokens`);
        return deleted;
    }
}

module.exports = new RefreshTokenService();
