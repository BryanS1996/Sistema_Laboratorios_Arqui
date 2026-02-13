const jwt = require('jsonwebtoken');

/**
 * Middleware para validar JWT desde URL (SSO)
 * Obtiene el token del parámetro de query: ?token=...
 * Útil para redirecciones entre aplicaciones
 */
function verifySSOTokenFromURL(req, res, next) {
  // Security check
  if (!process.env.JWT_SECRET) {
    console.error('🔴 FATAL: JWT_SECRET is not configured!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Dev bypass
  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  DEV_BYPASS_AUTH enabled - SSO validation bypassed');
    req.user = {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'admin'
    };
    return next();
  }

  // Obtener token del query parameter: ?token=...
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    req.ssoToken = token; // Store the original token para el frontend
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Middleware para validar JWT desde Body (SSO - más seguro)
 * Obtiene el token del body JSON: { token: "..." }
 * Más seguro que pasar en URL
 */
function verifySSOTokenFromBody(req, res, next) {
  // Security check
  if (!process.env.JWT_SECRET) {
    console.error('🔴 FATAL: JWT_SECRET is not configured!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Dev bypass
  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  DEV_BYPASS_AUTH enabled - SSO validation bypassed');
    req.user = {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'admin'
    };
    return next();
  }

  // Obtener token del body: { token: "..." }
  const token = req.body?.token;

  if (!token) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    req.ssoToken = token; // Store the original token para el frontend
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(403).json({ 
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }
}

module.exports = {
  verifySSOTokenFromURL,
  verifySSOTokenFromBody
};
