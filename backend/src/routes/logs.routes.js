const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const { verifyToken } = require('../middleware/authJWT');
const { verifySSOTokenFromBody } = require('../middleware/ssoTokenFromURL');
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

/**
 * POST /api/logs/sso
 * SSO endpoint para APP B (Logs en otra aplicación)
 * Valida el token desde body (más seguro que URL)
 * Body params:
 *   - token: JWT del usuario (requerido)
 *   - limit: número de logs a retornar (default: 100)
 */
router.post('/sso', verifySSOTokenFromBody, logsController.getLogsViaSSOURL);

/**
 * GET /api/logs/sso (legacy)
 * Valida el token desde URL (mantener para compatibilidad)
 */
router.get('/sso', require('../middleware/ssoTokenFromURL').verifySSOTokenFromURL, logsController.getLogsViaSSOURL);

module.exports = router;
