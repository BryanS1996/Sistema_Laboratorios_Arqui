const UserDAO = require("../interfaces/UserDAO");
const { getPool } = require("../../config/postgres");

class UserPostgresDAO extends UserDAO {

  async create(userData) {
    const { email, passwordHash, nombre, role, firebaseUid } = userData;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO users(email, password_hash, nombre, role, firebase_uid)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, email, nombre, role, created_at, firebase_uid`,
      [email, passwordHash, nombre, role || 'student', firebaseUid || null]
    );
    return rows[0];
  }

  async findByEmail(email) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", created_at, last_login, firebase_uid 
       FROM users WHERE email=$1 LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  async findByFirebaseUid(uid) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", created_at, last_login, firebase_uid 
       FROM users WHERE firebase_uid=$1 LIMIT 1`,
      [uid]
    );
    return rows[0] || null;
  }

  async findById(id) {
    // Validate if id is an integer (Postgres serial)
    if (!Number.isInteger(Number(id))) {
      return null; // Handle legacy string IDs or invalid input
    }
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
    if (updates.firebaseUid) {
      fields.push(`firebase_uid=$${idx++}`);
      values.push(updates.firebaseUid);
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

  /**
   * Obtiene la carga académica completa del usuario.
   * - Profesor: Asignaturas que dicta y sus paralelos.
   * - Estudiante: Paralelos inscritos y horarios.
   */
  async getAcademicLoad(user) {
    const pool = getPool();
    const userId = user.id;
    const role = user.role;

    if (role === 'professor') {
      // Get subjects assigned to this professor
      const { rows } = await pool.query(`
        SELECT s.id as subject_id, s.name as subject_name, sem.name as semester_name, 
               p.id as parallel_id, p.name as parallel_name
        FROM professor_assignments pa
        JOIN subjects s ON pa.subject_id = s.id
        LEFT JOIN semesters sem ON s.semester_id = sem.id
        LEFT JOIN parallels p ON s.id = p.subject_id
        WHERE pa.professor_id = $1
        ORDER BY sem.level, s.name
      `, [userId]);

      // Structure: Subject -> Parallels
      const academicLoad = {};
      rows.forEach(row => {
        if (!academicLoad[row.subject_id]) {
          academicLoad[row.subject_id] = {
            id: row.subject_id,
            name: row.subject_name,
            semester: row.semester_name,
            parallels: []
          };
        }
        if (row.parallel_id) {
          academicLoad[row.subject_id].parallels.push({
            id: row.parallel_id,
            name: row.parallel_name
          });
        }
      });
      return Object.values(academicLoad);

    } else if (role === 'student') {
      // Get enrolled parallels and their schedules
      const { rows } = await pool.query(`
        SELECT p.id as parallel_id, p.name as parallel_name, 
               s.name as subject_name, sem.name as semester_name,
               sch.dia, sch.hora_inicio, sch.hora_fin, l.nombre as lab_name
        FROM student_enrollments se
        JOIN parallels p ON se.parallel_id = p.id
        JOIN subjects s ON p.subject_id = s.id
        LEFT JOIN semesters sem ON s.semester_id = sem.id
        LEFT JOIN schedules sch ON p.id = sch.parallel_id
        LEFT JOIN laboratories l ON sch.lab_id = l.id
        WHERE se.student_id = $1
      `, [userId]);

      // Structure: List of enrolled classes with schedule
      return rows.map(row => ({
        parallelId: row.parallel_id,
        parallelName: row.parallel_name,
        subjectName: row.subject_name,
        semesterName: row.semester_name,
        schedule: row.dia ? {
          day: row.dia,
          start: row.hora_inicio,
          end: row.hora_fin,
          lab: row.lab_name
        } : null
      }));
    }

    return null; // Admin has no load
  }

  async findAllWithDetails() {
    const pool = getPool();
    // Get basic user info
    const { rows: users } = await pool.query(`
      SELECT id, email, nombre, role, created_at, last_login 
      FROM users 
      ORDER BY role, nombre
    `);

    // Enrich with summary (e.g., student semester, professor subjects count)
    // This is a simplified approach to avoid N+1 queries or complex joins for now
    // Ideally we would do a massive join, but let's do parallel execution for now

    // We will attach a "context" string
    for (const user of users) {
      user.context = '';
      if (user.role === 'student') {
        // Get semester/parallel info (simplified: show first enrolled)
        const { rows } = await pool.query(`
                SELECT sem.name as semester, p.name as parallel
                FROM student_enrollments se
                JOIN parallels p ON se.parallel_id = p.id
                JOIN subjects s ON p.subject_id = s.id
                JOIN semesters sem ON s.semester_id = sem.id
                WHERE se.student_id = $1
                LIMIT 1
             `, [user.id]);
        if (rows.length > 0) user.context = `${rows[0].semester} (${rows[0].parallel})`;
      } else if (user.role === 'professor') {
        // Get subject count
        const { rows } = await pool.query(`
                SELECT COUNT(DISTINCT subject_id) as c FROM professor_assignments WHERE professor_id=$1
             `, [user.id]);
        user.context = `${rows[0].c} Asignaturas`;
      }
    }
    return users;
  }

  async updateRole(id, newRole) {
    if (!['admin', 'professor', 'student'].includes(newRole)) throw new Error("Rol inválido");
    const pool = getPool();
    const { rows } = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, email, role",
      [newRole, id]
    );
    return rows[0];
  }

  async updateStudentSemester(studentId, semester, parallelName = 'A') {
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Clear existing enrollments
      await client.query('DELETE FROM student_enrollments WHERE student_id = $1', [studentId]);

      // 2. Find Parallels for the given Semester and Parallel Name
      const { rows: parallels } = await client.query(`
            SELECT p.id 
            FROM parallels p
            JOIN subjects s ON p.subject_id = s.id
            WHERE s.semester_id = $1 AND p.name = $2
        `, [semester, parallelName]);

      if (parallels.length > 0) {
        const values = parallels.map((p, i) => `($1, $${i + 2})`).join(',');
        const query = `INSERT INTO student_enrollments (student_id, parallel_id) VALUES ${values}`;
        await client.query(query, [studentId, ...parallels.map(p => p.id)]);
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

module.exports = UserPostgresDAO;
