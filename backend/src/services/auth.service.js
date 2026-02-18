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

    // 1. Check if user exists in local DB
    const exists = await this.userDAO.findByEmail(emailNorm);
    if (exists) throw new Error("Email ya registrado");

    // 2. Create in Local DB (PostgreSQL)
    const passwordHash = await bcrypt.hash(password, 10);
    const finalRole = (role === 'professor') ? 'professor' : 'student';

    const user = await this.userDAO.create({
      email: emailNorm,
      passwordHash,
      nombre,
      role: finalRole
    });

    // Auto-enroll if student data provided
    if (finalRole === 'student' && semesterId && parallelName) {
      try {
        await this.userDAO.updateStudentSemester(user.id, semesterId, parallelName);
      } catch (e) {
        console.error("Error auto-enrolling student:", e);
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

    // 1. Try to find user in Local DB first
    let user = await this.userDAO.findByEmail(emailNorm);
    let authenticatedLocally = false;

    // 2. Validate against Postgres
    if (user && user.passwordHash) {
      // Check password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (validPassword) {
        authenticatedLocally = true;
        console.log(`[DEBUG] Login: Local authentication successful for ${emailNorm}`);
      } else {
        console.log(`[DEBUG] Login: Local password mismatch for ${emailNorm}.`);
      }
    }

    if (!authenticatedLocally) {
      // Password doesn't match - authentication failed
      throw new Error("Credenciales inválidas");
    }

    // 5. Generate Backend JWTs
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
    await AuditService.log(
      user.id,
      AuditService.ACTIONS.LOGIN,
      null,
      null,
      { method: 'local' },
      req
    );

    // Fetch Academic Load (Subjects/Parallels) for context in frontend
    try {
      const load = await this.userDAO.getAcademicLoad(user);
      user.academicLoad = load;
    } catch (err) {
      console.error("Error fetching academic load:", err);
      // Don't fail login, just log error
    }

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
