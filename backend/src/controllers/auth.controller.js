const authService = require('../services/auth.service');
const firebaseService = require('../services/firebase.service');
const refreshTokenService = require('../services/refreshToken.service');
const { getFactory } = require("../factories");

class AuthController {
  constructor() {
    this.userDAO = getFactory().createUserDAO();
  }
  /**
   * POST /auth/register - Register with email/password
   */
  async register(req, res) {
    try {
      const user = await authService.register(req.body, req);
      res.status(201).json({ user });
    } catch (error) {
      console.error('Register error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /auth/login - Login with email/password
   */
  async login(req, res) {
    try {
      const result = await authService.login(req.body, req);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * POST /auth/firebase - Login/Register with Firebase SSO
   */
  async firebaseLogin(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ error: 'Firebase ID token requerido' });
      }

      // Handle Firebase sign-in (creates user if doesn't exist)
      const { user, isNewUser } = await firebaseService.handleFirebaseSignIn(idToken);

      // Generate JWT tokens
      const jwt = require('jsonwebtoken');
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
      );

      const refreshToken = await refreshTokenService.generateRefreshToken(
        user.id,
        req.get('user-agent'),
        req.ip || req.connection?.remoteAddress
      );

      // Update last login
      await this.userDAO.updateLastLogin(user.id);

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      // Log SSO login
      const AuditService = require('../services/audit.service');
      await AuditService.log(user.id, AuditService.ACTIONS.SSO_LOGIN, null, null, { isNewUser }, req);

      res.json({
        accessToken,
        user: { id: user.id, email: user.email, nombre: user.nombre, role: user.role },
        isNewUser
      });
    } catch (error) {
      console.error('Firebase login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * POST /auth/refresh - Refresh access token using refresh token
   */
  async refresh(req, res) {
    try {
      // Get refresh token from cookie or body
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token no proporcionado' });
      }

      // Generate new access token
      const result = await refreshTokenService.refreshAccessToken(refreshToken);

      // Get user data to include in response
      const user = await this.userDAO.findById(result.userId);

      res.json({
        accessToken: result.accessToken,
        user: { id: user.id, email: user.email, nombre: user.nombre, role: user.role }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * POST /auth/logout - Logout user
   */
  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      await authService.logout(refreshToken, req);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({ message: 'Logout exitoso' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /auth/me - Get current user
   */
  async me(req, res) {
    try {
      const user = await authService.me(req.user.id);
      res.json({ user });
    } catch (error) {
      console.error('Me error:', error);
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
