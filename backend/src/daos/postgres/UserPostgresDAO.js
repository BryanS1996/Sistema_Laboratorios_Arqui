const UserDAO = require("../interfaces/UserDAO");
const { getPool } = require("../../config/postgres");

class UserPostgresDAO extends UserDAO {

  async create(userData) {
    const { email, passwordHash, nombre, role } = userData;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO users(email, password_hash, nombre, role)
       VALUES($1, $2, $3, $4)
       RETURNING id, email, nombre, role, created_at`,
      [email, passwordHash, nombre, role || 'student']
    );
    return rows[0];
  }

  async findByEmail(email) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", created_at, last_login 
       FROM users WHERE email=$1 LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", created_at, last_login 
       FROM users WHERE id=$1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  async updateLastLogin(id) {
    const pool = getPool();
    await pool.query(
      "UPDATE users SET last_login=NOW() WHERE id=$1",
      [id]
    );
  }

  async update(id, updates) {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.nombre) {
      fields.push(`nombre=$${idx++}`);
      values.push(updates.nombre);
    }
    if (updates.role) {
      fields.push(`role=$${idx++}`);
      values.push(updates.role);
    }
    if (updates.passwordHash) {
      fields.push(`password_hash=$${idx++}`);
      values.push(updates.passwordHash);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`;

    const pool = getPool();
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findAll() {
    const pool = getPool();
    const { rows } = await pool.query("SELECT id, email, nombre, role FROM users ORDER BY nombre");
    return rows;
  }

  async delete(id) {
    const pool = getPool();
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
  }
}

module.exports = UserPostgresDAO;
