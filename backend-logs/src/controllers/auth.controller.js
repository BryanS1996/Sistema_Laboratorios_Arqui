const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const userDAO = require('../daos/UserDAO');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Controller de Autenticación - Backend B
 * Maneja login con Google OAuth para App B
 */

/**
 * POST /auth/login
 * Login con Email/Password (Solo Admins)
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        const user = await userDAO.findByEmail(email);

        if (!user || user.role !== 'admin') {
            // No revelar si usuario existe o no es admin
            return res.status(401).json({ error: 'Credenciales inválidas o acceso denegado' });
        }

        if (!user.password_hash) {
            return res.status(401).json({
                error: 'Este usuario no tiene contraseña configurada. Use "Iniciar sesión con Google".'
            });
        }

        // Verificar contraseña
        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                role: user.role
            },
            token
        });

    } catch (error) {
        console.error('Error en Login manual:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

/**
 * POST /auth/google
 * Login con Google OAuth (Direct login en App B)
 */
async function googleLogin(req, res) {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: 'ID Token no proporcionado' });
        }

        // Verificar token de Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Buscar o crear usuario en PostgreSQL B
        let user = await userDAO.findByEmail(email);

        if (!user) {
            // Crear nuevo usuario
            user = await userDAO.create({
                email,
                nombre: name,
                role: 'student', // Por defecto estudiante
                googleId
            });
            console.log(`✨ Nuevo usuario creado en App B: ${email}`);
        } else {
            // Usuario existe: Auto-reparación de Google ID (si venía de sync con placeholder)
            if (user.google_id !== googleId) {
                console.log(`🔧 Actualizando Google ID para ${email} (Auto-fix de Sync)...`);
                await userDAO.updateGoogleId(user.id, googleId);
                user.google_id = googleId; // Actualizar objeto local
            }
        }

        // Verificar que sea admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                error: 'Acceso denegado',
                message: 'Solo administradores pueden acceder a esta aplicación'
            });
        }

        // Generar JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                nombre: user.nombre,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Error en Google login:', error);
        res.status(500).json({
            error: 'Error al procesar login con Google',
            details: error.message
        });
    }
}

/**
 * GET /auth/me
 * Obtiene usuario actual
 */
async function getMe(req, res) {
    res.json({
        user: req.user
    });
}

module.exports = { googleLogin, getMe, login };
