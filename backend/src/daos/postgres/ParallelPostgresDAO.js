const { getPool } = require("../../config/postgres");

class ParallelPostgresDAO {
    async create({ name, subjectId }) {
        const pool = getPool();
        const { rows } = await pool.query(
            "INSERT INTO parallels(name, subject_id) VALUES($1, $2) RETURNING *",
            [name, subjectId]
        );
        return rows[0];
    }

    async findAll() {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM parallels ORDER BY name");
        return rows;
    }

    async findBySubject(subjectId) {
        const pool = getPool();
        const { rows } = await pool.query(
            "SELECT * FROM parallels WHERE subject_id=$1 ORDER BY name",
            [subjectId]
        );
        return rows;
    }

    async findById(id) {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM parallels WHERE id=$1", [id]);
        return rows[0];
    }

    async update(id, { name }) {
        const pool = getPool();
        const { rows } = await pool.query(
            "UPDATE parallels SET name=$1 WHERE id=$2 RETURNING *",
            [name, id]
        );
        return rows[0];
    }

    async delete(id) {
        const pool = getPool();
        await pool.query("DELETE FROM parallels WHERE id=$1", [id]);
        return true;
    }

    // Student Assignment
    async assignStudent(studentId, parallelId) {
        const pool = getPool();
        await pool.query(
            "INSERT INTO student_parallels(student_id, parallel_id) VALUES($1, $2) ON CONFLICT DO NOTHING",
            [studentId, parallelId]
        );
    }

    async removeStudent(studentId, parallelId) {
        const pool = getPool();
        await pool.query(
            "DELETE FROM student_parallels WHERE student_id=$1 AND parallel_id=$2",
            [studentId, parallelId]
        );
    }

    async getParallelsByStudent(studentId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT p.*, s.name as subject_name FROM parallels p
       JOIN student_parallels sp ON sp.parallel_id = p.id
       JOIN subjects s ON s.id = p.subject_id
       WHERE sp.student_id = $1`,
            [studentId]
        );
        return rows;
    }

    async findNamesBySemester(semesterId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT DISTINCT p.name 
             FROM parallels p 
             JOIN subjects s ON p.subject_id = s.id 
             WHERE s.semester_id = $1 
             ORDER BY p.name`,
            [semesterId]
        );
        return rows;
    }
}

module.exports = ParallelPostgresDAO;
