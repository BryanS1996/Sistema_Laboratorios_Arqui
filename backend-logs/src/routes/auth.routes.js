const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/ssoTokenFromBody');

/**
 * POST /auth/login
 * Login con Email/Password (Admin)
 */
router.post('/login', authController.login);

/**
 * POST /auth/google
 * Login directo con Google OAuth en App B
 */
router.post('/google', authController.googleLogin);

/**
 * GET /auth/me
 * Obtiene usuario actual autenticado
 */
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
