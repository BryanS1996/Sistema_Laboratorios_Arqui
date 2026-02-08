const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserDTO = require("../dtos/UserDTO");
const UserDAO = require("../daos/firestore/UserFirestoreDAO");
const RefreshTokenService = require("./refreshToken.service");
const AuditService = require("./audit.service");
const { determineRole } = require("../utils/roleAssignment");
const { isValidEmail, normalizeEmail } = require("../utils/validators");

class AuthService {


  async register({ email, password, nombre }, req = null) {
    if (!email || !password || !nombre) {
      throw new Error("Faltan campos: email, password, nombre");
    }

    // Validación de email (más estricta que el input type="email" del navegador)
    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      throw new Error("Email inválido");
    }

    const exists = await UserDAO.findByEmail(emailNorm);
    if (exists) throw new Error("Email ya registrado");

    const passwordHash = await bcrypt.hash(password, 10);

    // Determine role from ADMIN_EMAILS whitelist
    const role = determineRole(emailNorm);

    const user = await UserDAO.create({
      email: emailNorm,
      passwordHash,
      nombre,
      role // Assigned from whitelist
    });

    // Log registration
    await AuditService.log(user.id, AuditService.ACTIONS.REGISTER, null, null, { email: emailNorm }, req);

    return new UserDTO(user);
  }


  async login({ email, password }, req = null) {
    if (!email || !password) {
      throw new Error("Faltan campos: email, password");
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      throw new Error("Email inválido");
    }

    const user = await UserDAO.findByEmail(emailNorm);
    if (!user) throw new Error("Credenciales inválidas");

    // Check if user has password (might be SSO-only user)
    if (!user.passwordHash) {
      throw new Error("Esta cuenta usa inicio de sesión social. Por favor usa Google/GitHub/Microsoft.");
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error("Credenciales inválidas");

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
    );

    // Generate refresh token (long-lived)
    const deviceInfo = req ? req.get('user-agent') : null;
    const ipAddress = req ? (req.ip || req.connection?.remoteAddress) : null;
    const refreshToken = await RefreshTokenService.generateRefreshToken(
      user.id,
      deviceInfo,
      ipAddress
    );

    // Update last login
    await UserDAO.updateLastLogin(user.id);

    // Log login
    await AuditService.log(user.id, AuditService.ACTIONS.LOGIN, null, null, {}, req);

    return {
      accessToken,
      refreshToken,
      user: new UserDTO(user)
    };
  }


  async me(userId) {
    const user = await UserDAO.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    return new UserDTO(user);
  }

  /**
   * Logout user - revoke refresh token
   */
  async logout(refreshToken, req = null) {
    if (refreshToken) {
      await RefreshTokenService.revokeRefreshToken(refreshToken);
    }

    // Note: userId should be extracted from access token before calling this
    if (req && req.user) {
      await AuditService.log(req.user.id, AuditService.ACTIONS.LOGOUT, null, null, {}, req);
    }
  }
}

module.exports = new AuthService();
