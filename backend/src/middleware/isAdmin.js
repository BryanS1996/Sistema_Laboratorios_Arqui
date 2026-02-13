/**
 * Middleware de Autorización para Administradores
 * 
 * Verifica que el usuario autenticado tenga el rol de 'admin'.
 * Debe usarse después del middleware authJWT.
 */

function isAdmin(req, res, next) {
    // Verificar que el usuario exista (debería estar disponible por authJWT)
    if (!req.user) {
        return res.status(401).json({
            error: 'No autenticado. Se requiere autenticación.'
        });
    }

    // Verificar que el usuario tenga rol de administrador
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Acceso denegado. Se requieren privilegios de administrador.'
        });
    }

    // Usuario es admin, continuar
    next();
}

module.exports = isAdmin;
