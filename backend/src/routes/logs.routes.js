const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const { verifyToken } = require('../middleware/authJWT');
const isAdmin = require('../middleware/isAdmin');

/**
 * Rutas de Logs de Auditoría
 * Todas las rutas requieren autenticación JWT y rol de administrador
 */

/**
 * GET /api/logs/recent
 * Obtiene los logs más recientes del sistema
 * Query params:
 *   - limit: número de logs a retornar (default: 100)
 */
router.get('/recent', verifyToken, isAdmin, logsController.getRecentLogs);

/**
 * GET /api/logs/stats
 * Obtiene estadísticas de los logs
 * Query params:
 *   - timeRange: 'day' | 'week' | 'month' (default: 'day')
 */
router.get('/stats', verifyToken, isAdmin, logsController.getLogStats);

module.exports = router;
