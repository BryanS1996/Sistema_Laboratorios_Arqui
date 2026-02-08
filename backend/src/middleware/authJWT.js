const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT access token
 * 
 * ⚠️  SECURITY: No fallback secrets - fails if JWT_SECRET not configured
 */
function verifyToken(req, res, next) {
  // Security check: Ensure JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('🔴 FATAL: JWT_SECRET is not configured!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Dev bypass (ONLY for development!)
  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    console.warn('⚠️  DEV_BYPASS_AUTH is enabled - bypassing authentication');
    req.user = {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'admin'
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
}

/**
 * Middleware to check user role
 * 
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'student')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso',
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

module.exports = {
  verifyToken,
  requireRole,
  requireAdmin
};
