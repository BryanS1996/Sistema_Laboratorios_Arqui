const { getPoolAppB } = require('../config/postgres-appb');

/**
 * UserDAO - Acceso a usuarios de App B en PostgreSQL B
 */
class UserDAO {
    /**
     * Buscar usuario por email
     */
    async findByEmail(email) {
        const pool = getPoolAppB();
        const { rows } = await pool.query(
            'SELECT id, email, nombre, role, google_id, password_hash FROM users WHERE email = $1',
            [email]
        );
        return rows[0] || null;
    }

    /**
     * Crear nuevo usuario
     */
    async create({ email, nombre, role, googleId }) {
        const pool = getPoolAppB();
        const { rows } = await pool.query(
            `INSERT INTO users(email, nombre, role, google_id)
       VALUES($1, $2, $3, $4)
       RETURNING id, email, nombre, role, google_id`,
            [email, nombre, role || 'student', googleId]
        );
        return rows[0];
    }

    /**
     * Buscar usuario por ID
     */
    async findById(id) {
        const pool = getPoolAppB();
        const { rows } = await pool.query(
            'SELECT id, email, nombre, role, google_id FROM users WHERE id = $1',
            [id]
        );
        return rows[0] || null;
    }

    /**
     * Actualizar Google ID (Auto-fix)
     */
    async updateGoogleId(id, googleId) {
        const pool = getPoolAppB();
        await pool.query(
            'UPDATE users SET google_id = $1 WHERE id = $2',
            [googleId, id]
        );
    }
}

module.exports = new UserDAO();
