const auditService = require('../services/audit.service');
const redisService = require('../services/redis.service');

/**
 * Controlador de Logs de Auditoría
 * Proporciona acceso a los registros de auditoría del sistema
 */

/**
 * Obtener los logs recientes del sistema
 * Intenta obtenerlos de Redis primero (rápido), si no de Postgres (respaldo)
 */
async function getRecentLogs(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 100;

        // Intentar obtener desde Redis primero
        let logs = await redisService.lRange('recent_audit_logs', 0, limit - 1);

        // Si Redis no tiene datos o está vacío, obtener de Postgres
        if (!logs || logs.length === 0) {
            console.log('📊 Redis vacío, obteniendo logs desde Postgres...');
            logs = await auditService.getRecent(limit);
        } else {
            console.log(`📊 Logs obtenidos desde Redis: ${logs.length} registros`);
        }

        // Ordenar por fecha descendente (más recientes primero)
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
        console.error('Error obteniendo logs recientes:', error);
        res.status(500).json({
            error: 'Error al obtener los logs del sistema',
            details: error.message
        });
    }
}

/**
 * Obtener estadísticas de los logs
 */
async function getLogStats(req, res) {
    try {
        const timeRange = req.query.timeRange || 'day';

        // Obtener logs recientes
        const logs = await auditService.getRecent(1000);

        // Calcular fecha límite según el rango
        const now = new Date();
        let startDate;
        switch (timeRange) {
            case 'day':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        // Filtrar logs por fecha
        const filteredLogs = logs.filter(log => {
            const logDate = new Date(log.created_at || log.createdAt);
            return logDate >= startDate;
        });

        // Agrupar por acción
        const byAction = {};
        filteredLogs.forEach(log => {
            byAction[log.action] = (byAction[log.action] || 0) + 1;
        });

        res.json({
            success: true,
            total: filteredLogs.length,
            byAction,
            timeRange
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas de logs:', error);
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            details: error.message
        });
    }
}

module.exports = {
    getRecentLogs,
    getLogStats
};
