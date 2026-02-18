/**
 * Middleware de autorización: Solo Admins
 */
function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'Solo administradores pueden acceder a esta función',
            yourRole: req.user.role,
            requiredRole: 'admin'
        });
    }

    next();
}

module.exports = isAdmin;
