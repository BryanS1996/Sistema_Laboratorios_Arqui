const { getPool } = require("../../config/postgres");

class SchedulesPostgresDAO {
    async create(data) {
        const { parallelId, labId, dia, horaInicio, horaFin } = data;
        const pool = getPool();
        const { rows } = await pool.query(
            `INSERT INTO schedules (parallel_id, lab_id, dia, hora_inicio, hora_fin) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [parallelId, labId, dia, horaInicio, horaFin]
        );
        return rows[0];
    }

    async findConflicts(labId, dia, horaInicio, horaFin) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT * FROM schedules 
       WHERE lab_id = $1 
         AND dia = $2 
         AND (
           (hora_inicio < $4 AND hora_fin > $3) -- Overlap condition
         )`,
            [labId, dia, horaInicio, horaFin]
        );
        return rows;
    }

    async findByParallel(parallelId) {
        const pool = getPool();
        const { rows } = await pool.query(
            `SELECT s.*, l.nombre as lab_name, l.ubicacion 
       FROM schedules s
       JOIN laboratories l ON s.lab_id = l.id
       WHERE s.parallel_id = $1`,
            [parallelId]
        );
        return rows;
    }

    async findAll() {
        const pool = getPool();
        const { rows } = await pool.query(`
        SELECT s.*, p.name as parallel_name, l.nombre as lab_name, sub.name as subject_name
        FROM schedules s
        JOIN laboratories l ON s.lab_id = l.id
        JOIN parallels p ON s.parallel_id = p.id
        JOIN subjects sub ON p.subject_id = sub.id
      `);
        return rows;
    }

    async delete(id) {
        const pool = getPool();
        await pool.query("DELETE FROM schedules WHERE id = $1", [id]);
    }
}

module.exports = SchedulesPostgresDAO;
