const { getPoolAppA } = require('../config/postgres-appa');

/**
 * AuditLogDAO - Acceso READONLY a audit_logs de App A en PostgreSQL A
 */
class AuditLogDAO {
    /**
     * Obtener logs recientes (readonly)
     */
    async getRecent(limit = 100) {
        const pool = getPoolAppA();
        const { rows } = await pool.query(
            `SELECT id, user_id as "userId", action, entity_type as "entityType", 
              entity_id as "entityId", details, ip_address as "ipAddress", 
              created_at as "createdAt"
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
            [limit]
        );
        return rows;
    }
}

module.exports = new AuditLogDAO();
