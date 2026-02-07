const UserDAO = require("../interfaces/UserDAO");
const { getPool } = require("../../config/postgres");

class UserPostgresDAO extends UserDAO {
  async findByEmail(email) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id, email, nombre, password_hash FROM users WHERE email=$1 LIMIT 1",
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const pool = getPool();
    const { rows } = await pool.query(
      "SELECT id, email, nombre FROM users WHERE id=$1 LIMIT 1",
      [id]
    );
    return rows[0] || null;
  }

  async create({ email, passwordHash, nombre }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO users(email, nombre, password_hash)
       VALUES($1,$2,$3)
       RETURNING id, email, nombre`,
      [email, nombre, passwordHash]
    );
    return rows[0];
  }
}

module.exports = UserPostgresDAO;
