const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserDTO = require("../dtos/UserDTO");
const { getFactory } = require("../factories");
const { isValidEmail, normalizeEmail } = require("../utils/validators");

class AuthService {
  constructor() {
    const factory = getFactory();
    this.userDAO = factory.createUserDAO();
  }

  async register({ email, password, nombre }) {
    if (!email || !password || !nombre) {
      throw new Error("Faltan campos: email, password, nombre");
    }

    // Validación de email (más estricta que el input type="email" del navegador)
    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      throw new Error("Email inválido");
    }

    const exists = await this.userDAO.findByEmail(emailNorm);
    if (exists) throw new Error("Email ya registrado");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userDAO.create({ email: emailNorm, passwordHash, nombre });
    return new UserDTO(user);
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error("Faltan campos: email, password");
    }

    const emailNorm = normalizeEmail(email);
    if (!isValidEmail(emailNorm)) {
      throw new Error("Email inválido");
    }

    const user = await this.userDAO.findByEmail(emailNorm);
    if (!user) throw new Error("Credenciales inválidas");

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new Error("Credenciales inválidas");

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return { token, user: new UserDTO(user) };
  }

  async me(userId) {
    const user = await this.userDAO.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    return new UserDTO(user);
  }
}

module.exports = new AuthService();
