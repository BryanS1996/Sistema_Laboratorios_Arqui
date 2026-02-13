const { getPool } = require('../../config/postgres');

class AuditLogPostgresDAO {
    /**
     * Create a new audit log entry
     */
    async create(log) {
        const pool = getPool();
        const { userId, action, entityType, entityId, details, ipAddress, userAgent } = log;

        const { rows } = await pool.query(
            `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at`,
            [userId, action, entityType, entityId, JSON.stringify(details || {}), ipAddress, userAgent]
        );

        return {
            id: rows[0].id,
            userId: rows[0].user_id,
            action: rows[0].action,
            entityType: rows[0].entity_type,
            entityId: rows[0].entity_id,
            details: rows[0].details,
            ipAddress: rows[0].ip_address,
            userAgent: rows[0].user_agent,
            createdAt: rows[0].created_at
        };
    }

    /**
     * Find audit logs by user with pagination
     */
    async findByUser(userId, limit = 50, offset = 0) {
        const pool = getPool();

        const { rows } = await pool.query(
            `SELECT id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at
             FROM audit_logs
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            action: row.action,
            entityType: row.entity_type,
            entityId: row.entity_id,
            details: row.details,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            createdAt: row.created_at
        }));
    }

    /**
     * Find audit logs by entity (e.g., all changes to a specific reserva)
     */
    async findByEntity(entityType, entityId, limit = 50) {
        const pool = getPool();

        const { rows } = await pool.query(
            `SELECT id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at
             FROM audit_logs
             WHERE entity_type = $1 AND entity_id = $2
             ORDER BY created_at DESC
             LIMIT $3`,
            [entityType, entityId, limit]
        );

        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            action: row.action,
            entityType: row.entity_type,
            entityId: row.entity_id,
            details: row.details,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            createdAt: row.created_at
        }));
    }

    /**
     * Query audit logs with filters
     */
    async query(filters = {}, limit = 100) {
        const pool = getPool();
        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (filters.userId) {
            conditions.push(`user_id = $${paramIndex++}`);
            params.push(filters.userId);
        }

        if (filters.action) {
            conditions.push(`action = $${paramIndex++}`);
            params.push(filters.action);
        }

        if (filters.entityType) {
            conditions.push(`entity_type = $${paramIndex++}`);
            params.push(filters.entityType);
        }

        if (filters.startDate) {
            conditions.push(`created_at >= $${paramIndex++}`);
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            conditions.push(`created_at <= $${paramIndex++}`);
            params.push(filters.endDate);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(limit);

        const { rows } = await pool.query(
            `SELECT id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at
             FROM audit_logs
             ${whereClause}
             ORDER BY created_at DESC
             LIMIT $${paramIndex}`,
            params
        );

        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            action: row.action,
            entityType: row.entity_type,
            entityId: row.entity_id,
            details: row.details,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            createdAt: row.created_at
        }));
    }

    /**
     * Get recent logs (admin view)
     */
    async getRecent(limit = 100) {
        const pool = getPool();

        const { rows } = await pool.query(
            `SELECT id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at
             FROM audit_logs
             ORDER BY created_at DESC
             LIMIT $1`,
            [limit]
        );

        return rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            action: row.action,
            entityType: row.entity_type,
            entityId: row.entity_id,
            details: row.details,
            ipAddress: row.ip_address,
            userAgent: row.user_agent,
            createdAt: row.created_at
        }));
    }
}

module.exports = new AuditLogPostgresDAO();
