const { getPool } = require("../../config/postgres");

class SemesterPostgresDAO {
    async findAll() {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM semesters ORDER BY level");
        return rows;
    }

    async findById(id) {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM semesters WHERE id=$1", [id]);
        return rows[0];
    }
}

module.exports = SemesterPostgresDAO;
