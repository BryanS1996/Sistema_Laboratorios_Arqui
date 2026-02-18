const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');
const { verifySSOTokenFromBody, verifyToken } = require('../middleware/ssoTokenFromBody');
const isAdmin = require('../middleware/isAdmin');

/**
 * POST /api/logs/sso
 * Endpoint para SSO desde App A
 * Body: { token: <JWT>, limit?: number }
 */
router.post('/sso', verifySSOTokenFromBody, isAdmin, logsController.getLogsViaSSOURL);

/**
 * GET /api/logs/recent
 * Obtiene logs recientes (auth tradicional con header)
 */
router.get('/recent', verifyToken, isAdmin, logsController.getRecentLogs);

module.exports = router;
