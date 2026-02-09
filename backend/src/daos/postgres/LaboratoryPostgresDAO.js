const { getPool } = require("../../config/postgres");

class LaboratoryPostgresDAO {
    async create(data) {
        const { nombre, capacidad, ubicacion } = data;
        const pool = getPool();
        const { rows } = await pool.query(
            "INSERT INTO laboratories (nombre, capacidad, ubicacion) VALUES ($1, $2, $3) RETURNING *",
            [nombre, capacidad, ubicacion]
        );
        return rows[0];
    }

    async findAll() {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM laboratories WHERE active = true ORDER BY nombre");
        return rows;
    }

    async findById(id) {
        const pool = getPool();
        const { rows } = await pool.query("SELECT * FROM laboratories WHERE id = $1 AND active = true", [id]);
        return rows[0];
    }

    async update(id, data) {
        const fields = [];
        const values = [];
        let idx = 1;

        if (data.nombre) { fields.push(`nombre=$${idx++}`); values.push(data.nombre); }
        if (data.capacidad) { fields.push(`capacidad=$${idx++}`); values.push(data.capacidad); }
        if (data.ubicacion) { fields.push(`ubicacion=$${idx++}`); values.push(data.ubicacion); }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const query = `UPDATE laboratories SET ${fields.join(", ")} WHERE id=$${idx} RETURNING *`;
        const pool = getPool();
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    async delete(id) {
        // Soft delete
        const pool = getPool();
        await pool.query("UPDATE laboratories SET active = false WHERE id = $1", [id]);
        return { id, active: false };
    }
}

module.exports = LaboratoryPostgresDAO;
