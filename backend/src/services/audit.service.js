const AuditLogDAO = require('../daos/postgres/AuditLogPostgresDAO');
const redisService = require('./redis.service');

class AuditService {
    /**
     * Log an action
     */
    async log(userId, action, entityType = null, entityId = null, details = {}, req = null) {
        const logEntry = {
            userId,
            action,
            entityType,
            entityId,
            details,
            ipAddress: req ? this.getIpAddress(req) : null,
            userAgent: req ? req.get('user-agent') : null,
            createdAt: new Date()
        };

        // 1. Persistence to Postgres (Main DB)
        try {
            await AuditLogDAO.create(logEntry);
        } catch (err) {
            console.error('Failed to persist audit log to Postgres:', err);
        }

        // 2. Dual-write to Redis for real-time reporting
        try {
            // Push to a "recent logs" list (keep last 100)
            await redisService.lPush('recent_audit_logs', logEntry, 100);

            // Publish to a real-time channel
            await redisService.publish('audit_logs_channel', logEntry);
        } catch (err) {
            console.error('Failed to write audit log to Redis:', err);
        }
    }

    /**
     * Get IP address from request
     */
    getIpAddress(req) {
        return req.ip || req.connection?.remoteAddress || null;
    }

    /**
     * Get audit trail for a user
     */
    async getUserAuditTrail(userId, limit = 50) {
        return await AuditLogDAO.findByUser(userId, limit);
    }

    /**
     * Get audit trail for an entity
     */
    async getEntityHistory(entityType, entityId) {
        return await AuditLogDAO.findByEntity(entityType, entityId);
    }

    /**
     * Search audit logs with filters
     */
    async search(filters, limit = 100) {
        return await AuditLogDAO.query(filters, limit);
    }

    /**
     * Get recent audit logs (admin view)
     */
    async getRecent(limit = 100) {
        return await AuditLogDAO.getRecent(limit);
    }

    // Common action constants
    static ACTIONS = {
        // Auth actions
        LOGIN: 'LOGIN',
        LOGOUT: 'LOGOUT',
        REGISTER: 'REGISTER',
        SSO_LOGIN: 'SSO_LOGIN',

        // Reservation actions
        CREATE_RESERVA: 'CREATE_RESERVA',
        UPDATE_RESERVA: 'UPDATE_RESERVA',
        DELETE_RESERVA: 'DELETE_RESERVA',

        // Report actions
        CREATE_REPORT: 'CREATE_REPORT',
        UPDATE_REPORT_STATUS: 'UPDATE_REPORT_STATUS',
        ASSIGN_REPORT: 'ASSIGN_REPORT',

        // User management
        UPDATE_USER_ROLE: 'UPDATE_USER_ROLE',
        DELETUSER: 'DELETE_USER'
    };
}

// Crear instancia del servicio
const auditServiceInstance = new AuditService();

// Exportar instancia con ACTIONS adjuntas
auditServiceInstance.ACTIONS = AuditService.ACTIONS;

module.exports = auditServiceInstance;
