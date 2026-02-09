const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserDTO = require("../dtos/UserDTO");
// Remove hardcoded Firestore DAO
const { getFactory } = require("../factories");
const RefreshTokenService = require("./refreshToken.service");
const AuditService = require("./audit.service");
const { determineRole } = require("../utils/roleAssignment");
const { isValidEmail, normalizeEmail } = require("../utils/validators");

class AuthService {
  constructor() {
    this.userDAO = getFactory().createUserDAO();
  }



  async register({ email, password, nombre, semesterId, parallelName, role, subjectIds }, req = null) {
    if (!email || !password || !nombre) {
      throw new Error("Faltan campos: email, password, nombre");
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      throw new Error("Email inválido");
    }

<<<<<<< HEAD
    // 1. Check if user exists in Firestore
    const exists = await UserDAO.findByEmail(emailNorm);
    if (exists) throw new Error("Email ya registrado (en base de datos local)");

    // 2. Create user in Firebase Authentication (using Admin SDK)
    const { admin } = require('../config/firebase.config');
    let firebaseUid;

    try {
      const userRecord = await admin.auth().createUser({
        email: emailNorm,
        password: password,
        displayName: nombre,
        emailVerified: false,
        disabled: false
      });
      firebaseUid = userRecord.uid;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        // If exists in Firebase but not local, we should arguably proceed to create local,
        // but let's throw for now to avoid confusion or fetch the uid.
        // Actually, let's fetch the user to get the UID if it exists.
        const userRecord = await admin.auth().getUserByEmail(emailNorm);
        firebaseUid = userRecord.uid;
      } else {
        console.error("Firebase Admin Create User Error:", error);
        throw new Error(`Error al crear usuario en Firebase: ${error.message}`);
      }
    }

    // 3. Determine role
    const role = determineRole(emailNorm);

    // 4. Create user in Firestore (using firebaseUid as ID)
    const user = await UserDAO.create({
      id: firebaseUid,
      email: emailNorm, // We keep 'email' as standard. 'correo' in DB is legacy/inconsistent.
      nombre,
      rol: role // Saving as 'rol' to match Firestore consistency
=======
    const exists = await this.userDAO.findByEmail(emailNorm);
    if (exists) throw new Error("Email ya registrado");

    const passwordHash = await bcrypt.hash(password, 10);

    // Use provided role or default to student. 
    // Secure this if public registration should not allow 'admin' without extra checks.
    // For now, allow 'student' or 'professor'.
    const finalRole = (role === 'professor') ? 'professor' : 'student';

    const user = await this.userDAO.create({
      email: emailNorm,
      passwordHash,
      nombre,
      role: finalRole
>>>>>>> test
    });

    // Auto-enroll if student data provided
    if (finalRole === 'student' && semesterId && parallelName) {
      try {
        await this.userDAO.updateStudentSemester(user.id, semesterId, parallelName);
      } catch (e) {
        console.error("Error auto-enrolling student:", e);
        // Don't fail registration if enrollment fails, but log it
      }
    }

    // Assign subjects if professor
    if (finalRole === 'professor' && subjectIds && subjectIds.length > 0) {
      try {
        const SubjectPostgresDAO = require("../daos/postgres/SubjectPostgresDAO");
        const subjectDAO = new SubjectPostgresDAO();
        await subjectDAO.updateProfessorAssignments(user.id, subjectIds);
      } catch (e) {
        console.error("Error assigning subjects to professor:", e);
      }
    }

    // Log registration
    await AuditService.log(
      user.id,
      AuditService.ACTIONS.REGISTER,
      null,
      null,
      { email: emailNorm, semesterId, parallelName, role: finalRole, subjectIds },
      req
    );

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

<<<<<<< HEAD
    // 1. Verify credentials with Firebase REST API (Identity Toolkit)
    // We need the API KEY here. It's safe on backend.
    const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("Falta FIREBASE_API_KEY en variables de entorno del backend");
      throw new Error("Error de configuración del servidor (API Key missing)");
=======
    const user = await this.userDAO.findByEmail(emailNorm);
    if (!user) throw new Error("Credenciales inválidas");

    // Check if user has password (might be SSO-only user)
    if (!user.passwordHash) {
      throw new Error("Esta cuenta usa inicio de sesión social. Por favor usa Google/GitHub/Microsoft.");
>>>>>>> test
    }

    const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    let firebaseUser;
    try {
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailNorm,
          password: password,
          returnSecureToken: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorCode = data.error?.message || 'LOGIN_FAILED';
        if (errorCode === 'EMAIL_NOT_FOUND' || errorCode === 'INVALID_PASSWORD' || errorCode === 'INVALID_LOGIN_CREDENTIALS') {
          throw new Error("Credenciales inválidas");
        }
        if (errorCode === 'USER_DISABLED') {
          throw new Error("Usuario deshabilitado");
        }
        if (errorCode === 'PASSWORD_LOGIN_DISABLED') {
          throw new Error("El inicio de sesión con contraseña no está habilitado en Firebase.");
        }
        throw new Error(`Error de autenticación: ${errorCode}`);
      }

      firebaseUser = data; // contains idToken, localId (uid), email, refreshToken
    } catch (error) {
      // If it's our custom error, rethrow. If fetch failed, wrap it.
      if (error.message === "Credenciales inválidas" || error.message === "Usuario deshabilitado" || error.message.includes("habilitado")) {
        throw error;
      }
      console.error("Firebase REST Login Error:", error);
      throw new Error("Error al validar credenciales con proveedor de identidad");
    }

    // 2. Sync/Get user from Firestore
    // Even though Firebase authenticated them, we need our local Firestore User record for roles
    let user = await UserDAO.findByEmail(emailNorm);

    if (!user) {
      // Edge case: User exists in Auth but not in Firestore 'users' collection
      // Could happen if created directly in console. Auto-create/sync it.
      const role = determineRole(emailNorm);
      // Create with correct fields
      user = await UserDAO.create({
        id: firebaseUser.localId, // Use Firebase UID
        email: emailNorm,
        nombre: firebaseUser.displayName || emailNorm.split('@')[0],
        rol: role, // Save as 'rol'
        createdAt: new Date()
      });
    }

    // 3. Generate Backend JWTs
    // Normalize 'rol' to 'role' for JWT standard usage in middleware
    const userRole = user.rol || user.role || 'estudiante';

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
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
    await this.userDAO.updateLastLogin(user.id);

    // Log login
    await AuditService.log(user.id, AuditService.ACTIONS.LOGIN, null, null, {}, req);

    return {
      accessToken,
      refreshToken,
      user: new UserDTO(user)
    };
  }


  async me(userId) {
    const user = await this.userDAO.findById(userId);
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
