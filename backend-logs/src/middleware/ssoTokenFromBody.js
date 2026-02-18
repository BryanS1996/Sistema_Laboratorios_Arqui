const jwt = require('jsonwebtoken');

/**
 * Middleware para validar JWT desde Body (SSO)
 * Usado cuando App A redirige con token a App B
 * CRÍTICO: Usa el MISMO JWT_SECRET que App A
 */
function verifySSOTokenFromBody(req, res, next) {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({
            error: 'Token SSO no proporcionado',
            hint: 'El token debe enviarse en el body como { "token": "..." }'
        });
    }

    // Security check
    if (!process.env.JWT_SECRET) {
        console.error('🔴 FATAL: JWT_SECRET is not configured!');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // Validar con el MISMO secreto que usa App A
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Agregar info del usuario al request
        req.user = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        console.log(`✅ SSO Token válido para: ${req.user.email} (${req.user.role})`);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                message: 'Por favor vuelve a App A y refresca tu sesión',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                details: error.message,
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(500).json({
            error: 'Error al validar token',
            details: error.message
        });
    }
}

/**
 * Middleware JWT normal (para login directo en App B)
 */
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    try {
        console.log('🔍 Verificando token:', token.substring(0, 20) + '...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.userId || decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        console.log('✅ Token válido para:', req.user.email);
        next();
    } catch (error) {
        console.error('❌ Error verificando token:', error.name, error.message);
        return res.status(401).json({ error: 'Token inválido o expirado', details: error.message });
    }
}

module.exports = { verifySSOTokenFromBody, verifyToken };
