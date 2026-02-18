const redisService = require('../services/redis.service');
const auditLogDAO = require('../daos/AuditLogDAO');

/**
 * Controller de Logs - Backend B
 * Proporciona acceso a logs de auditoría con SSO y auth tradicional
 */

/**
 * GET /api/logs/recent
 * Obtiene logs recientes (auth tradicional)
 */
async function getRecentLogs(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 100;

        // Intentar Redis primero, PostgreSQL A como fallback
        let logs = await redisService.lRange('recent_audit_logs', 0, limit - 1);

        if (!logs || logs.length === 0) {
            console.log('📊 Redis vacío, obteniendo de PostgreSQL A (readonly)...');
            logs = await auditLogDAO.getRecent(limit);
        } else {
            console.log(`📊 Logs desde Redis: ${logs.length} registros`);
        }

        const sortedLogs = logs.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at);
            const dateB = new Date(b.createdAt || b.created_at);
            return dateB - dateA;
        });

        res.json({
            success: true,
            count: sortedLogs.length,
            logs: sortedLogs
        });
    } catch (error) {
        console.error('Error obteniendo logs:', error);
        res.status(500).json({
            error: 'Error al obtener logs',
            details: error.message
        });
    }
}

/**
 * POST /api/logs/sso
 * Obtiene logs via SSO (token de App A)
 * COMPONENTE CRUCIAL para integración SSO
 */
async function getLogsViaSSOURL(req, res) {
    try {
        // req.user ya viene del middleware ssoTokenFromBody
        const limit = parseInt(req.body.limit) || 100;

        // Ya verificado por isAdmin middleware, pero double-check
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: 'Solo administradores pueden acceder al dashboard de logs',
                yourRole: req.user.role
            });
        }

        // Obtener logs (Redis primero, PostgreSQL A fallback)
        let logs = await redisService.lRange('recent_audit_logs', 0, limit - 1);

        if (!logs || logs.length === 0) {
            console.log('📊 Redis vacío, obteniendo de PostgreSQL A (readonly)...');
            logs = await auditLogDAO.getRecent(limit);
        } else {
            console.log(`✅ SSO: ${logs.length} logs desde Redis para ${req.user.email}`);
        }

        const sortedLogs = logs.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at);
            const dateB = new Date(b.createdAt || b.created_at);
            return dateB - dateA;
        });

        res.json({
            success: true,
            count: sortedLogs.length,
            logs: sortedLogs,
            user: {
                email: req.user.email,
                role: req.user.role
            },
            ssoMode: true
        });
    } catch (error) {
        console.error('❌ Error en SSO logs:', error);
        res.status(500).json({
            error: 'Error al obtener logs',
            details: error.message
        });
    }
}

module.exports = { getRecentLogs, getLogsViaSSOURL };
