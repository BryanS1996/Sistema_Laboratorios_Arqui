const AuditLogDAO = require('../daos/firestore/AuditLogFirestoreDAO');

class AuditService {
    /**
     * Log an action
     */
    /**
     * Expose ACTIONS constants on the instance
     */
    get ACTIONS() {
        return AuditService.ACTIONS;
    }

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
            userAgent: req ? req.get('user-agent') : null
        };

        await AuditLogDAO.create(logEntry);
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
