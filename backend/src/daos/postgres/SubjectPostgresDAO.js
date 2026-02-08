const { getPool } = require("../../config/postgres");

class SubjectPostgresDAO {
    async create({ name, description }) {
        const pool = getPool();
        const { rows } = await pool.query(
            "INSERT INTO subjects(name, description) VALUES($1, $2) RETURNING *",
            [name, description]
        );
        return rows[0];
    }

    async findAll() {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM subjects ORDER BY name");
        return rows;
    }

    async findById(id) {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM subjects WHERE id=$1", [id]);
        return rows[0];
    }

    async update(id, { name, description }) {
        const pool = getPool();
        const { rows } = await pool.query(
            "UPDATE subjects SET name=$1, description=$2 WHERE id=$3 RETURNING *",
            [name, description, id]
        );
        return rows[0];
    }

    async delete(id) {
        const pool = getPool();
        await pool.query("DELETE FROM subjects WHERE id=$1", [id]);
        return true;
    }

    // Professor Assignment
    async assignProfessor(professorId, subjectId) {
        const pool = getPool();
        await pool.query(
            "INSERT INTO professor_subjects(professor_id, subject_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
            [professorId, subjectId]
        );
    }

    async removeProfessor(professorId, subjectId) {
        const pool = getPool();
        await pool.query(
            "DELETE FROM professor_subjects WHERE professor_id=$1 AND subject_id=$2",
            [professorId, subjectId]
        );
    }

    async getSubjectsByProfessor(professorId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT s.* FROM subjects s
       JOIN professor_subjects ps ON ps.subject_id = s.id
       WHERE ps.professor_id = $1`,
            [professorId]
        );
        return rows;
    }
}

module.exports = SubjectPostgresDAO;
