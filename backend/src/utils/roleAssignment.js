/**
 * Utilidad de Asignación de Roles
 * 
 * Determina el rol del usuario basándose en un sistema de whitelist seguro.
 * Los administradores se identifican mediante sus direcciones de correo electrónico
 * listadas en la variable de entorno ADMIN_EMAILS.
 * 
 * ⚠️  SEGURIDAD: Usa whitelist explícita, NO coincidencia de patrones
 */

/**
 * Determinar el rol del usuario basándose en el correo electrónico
 * 
 * @param {string} email - Dirección de correo electrónico del usuario
 * @returns {string} 'admin' o 'student'
 */
function determineRole(email) {
    // Normalizar el email (minúsculas y recortar espacios)
    const emailLower = email.toLowerCase().trim();

    // Obtener la lista de emails de administradores desde .env
    const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(e => e.length > 0);

    // Verificar si el email está en la whitelist de administradores
    if (adminEmails.includes(emailLower)) {
        return 'admin';
    }

    // Por defecto, todos los demás usuarios son estudiantes
<<<<<<< HEAD
    return 'estudiante';
=======
    return 'student';
>>>>>>> test
}

/**
 * Verificar si un email es un administrador
 * 
 * @param {string} email - Dirección de correo electrónico del usuario
 * @returns {boolean} true si es administrador
 */
function isAdmin(email) {
    return determineRole(email) === 'admin';
}

module.exports = {
    determineRole,
    isAdmin
};
