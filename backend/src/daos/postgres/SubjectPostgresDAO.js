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
            "INSERT INTO professor_assignments(professor_id, subject_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
            [professorId, subjectId]
        );
    }

    async removeProfessor(professorId, subjectId) {
        const pool = getPool();
        await pool.query(
            "DELETE FROM professor_assignments WHERE professor_id=$1 AND subject_id=$2",
            [professorId, subjectId]
        );
    }

    async getSubjectsByProfessor(professorId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT s.* FROM subjects s
       JOIN professor_assignments ps ON ps.subject_id = s.id
       WHERE ps.professor_id = $1`,
            [professorId]
        );
        return rows;
    }

    async getSubjectsByStudent(studentId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT DISTINCT s.* FROM subjects s
       JOIN parallels p ON p.subject_id = s.id
       JOIN student_enrollments se ON se.parallel_id = p.id
       WHERE se.student_id = $1
       ORDER BY s.name`,
            [studentId]
        );
        return rows;
    }

    async getProfessorBySubject(subjectId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT u.id, u.nombre, u.email FROM users u
             JOIN professor_assignments pa ON pa.professor_id = u.id
             WHERE pa.subject_id = $1
             LIMIT 1`,
            [subjectId]
        );
        return rows[0]; // Returns { id, nombre, email } or undefined
    }

    async updateProfessorAssignments(professorId, subjectIds) {
        const pool = getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Clear existing
            await client.query('DELETE FROM professor_assignments WHERE professor_id = $1', [professorId]);

            // 2. Insert new
            if (subjectIds && subjectIds.length > 0) {
                const values = subjectIds.map((sid, index) => `($1, $${index + 2})`).join(',');
                const query = `INSERT INTO professor_assignments (professor_id, subject_id) VALUES ${values}`;
                await client.query(query, [professorId, ...subjectIds]);
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = SubjectPostgresDAO;
