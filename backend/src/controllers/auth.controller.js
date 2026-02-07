const authService = require("../services/auth.service");

/**
 * Controlador de autenticación.
 *
 * Se mantiene liviano: delega reglas de negocio (validaciones, hash,
 * generación de token) al AuthService.
 */

async function register(req, res) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json(user);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function login(req, res) {
  try {
    const r = await authService.login(req.body);
    return res.json(r);
  } catch (e) {
    // Credenciales inválidas o validación de email/password
    return res.status(401).json({ message: e.message });
  }
}

async function me(req, res) {
  try {
    const user = await authService.me(req.user.id);
    return res.json(user);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
}

module.exports = { register, login, me };
