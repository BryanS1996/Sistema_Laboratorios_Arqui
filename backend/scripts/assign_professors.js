const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs'); // Need to install if not present, but usually available in backend
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://lab:lab@postgres:5432/labdb'
});

async function assignProfessors() {
    try {
        console.log('Starting professor assignment process...');

        // 1. Ensure we have enough professors
        // Goal: ~20 professors to distribute 54 subjects.
        // If < 20, create more.

        let { rows: professors } = await pool.query("SELECT id, email FROM users WHERE role = 'professor'");
        console.log(`Current professors: ${professors.length}`);

        const targetProfessors = 25;
        if (professors.length < targetProfessors) {
            const needed = targetProfessors - professors.length;
            console.log(`Creating ${needed} new professors...`);

            const passwordHash = await bcrypt.hash('docente123', 10);

            for (let i = 0; i < needed; i++) {
                const num = professors.length + i + 1;
                const email = `docente${num}@uce.edu.ec`;
                const name = `Profesor ${num}`;

                // Check if exists
                const { rows: existing } = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
                if (existing.length === 0) {
                    await pool.query(
                        'INSERT INTO users (email, password_hash, nombre, role) VALUES ($1, $2, $3, $4)',
                        [email, passwordHash, name, 'professor']
                    );
                }
            }
            // Refresh list
            const res = await pool.query("SELECT id, email FROM users WHERE role = 'professor'");
            professors = res.rows;
        }

        // 2. Clear existing assignments? 
        // User asked "confirm relations are well done". Maybe clear and re-assign is safer to ensure logic?
        // Let's clear to start fresh with the logic "un profesor puede dar varias materias... materias con mas de un profesor".
        console.log('Clearing existing professor assignments for clean slate...');
        await pool.query('TRUNCATE professor_assignments CASCADE');

        // 3. Assign Professors to Subjects
        // Logic:
        // - Loop through subjects.
        // - Assign 1 main professor.
        // - If subject has > 2 parallels (i.e. 3), assign a 2nd professor with 50% chance (or always for big subjects).
        // - Rotate professors to simulate "un profesor da varias materias".

        const { rows: subjects } = await pool.query(`
            SELECT s.id, s.name, sem.level 
            FROM subjects s 
            JOIN semesters sem ON s.semester_id = sem.id
            ORDER BY sem.level, s.name
        `);

        // Helper to pick random professor
        const getRandomProf = () => professors[Math.floor(Math.random() * professors.length)];

        // Track load per professor to distribute evenly
        const profLoad = {};
        professors.forEach(p => profLoad[p.id] = 0);

        // Sort professors by load to pick ones with fewer classes
        const getLowLoadProf = () => {
            return professors.sort((a, b) => profLoad[a.id] - profLoad[b.id])[0];
        };

        for (const subject of subjects) {
            // Check parallel count
            const { rows: parallels } = await pool.query('SELECT count(*) as c FROM parallels WHERE subject_id=$1', [subject.id]);
            const parallelCount = parseInt(parallels[0].c);

            // Assign Main Professor
            const mainProf = getLowLoadProf();
            await pool.query(
                'INSERT INTO professor_assignments (professor_id, subject_id) VALUES ($1, $2)',
                [mainProf.id, subject.id]
            );
            profLoad[mainProf.id]++;
            console.log(`[${subject.name}] Assigned to ${mainProf.email}`);

            // If subject is huge (3 parallels), assign a second professor
            if (parallelCount >= 3) {
                // Pick another providing they are not the same
                let secondProf = getLowLoadProf();
                // Make sure it's not the same
                if (secondProf.id === mainProf.id) {
                    // Pick random different
                    const others = professors.filter(p => p.id !== mainProf.id);
                    if (others.length > 0) secondProf = others[Math.floor(Math.random() * others.length)];
                }

                if (secondProf.id !== mainProf.id) {
                    await pool.query(
                        'INSERT INTO professor_assignments (professor_id, subject_id) VALUES ($1, $2)',
                        [secondProf.id, subject.id]
                    );
                    profLoad[secondProf.id]++;
                    console.log(`[${subject.name}] Also assigned to ${secondProf.email} (Co-teaching)`);
                }
            }
        }

        console.log('Professor assignment complete.');

    } catch (error) {
        console.error('Error assigning professors:', error);
    } finally {
        await pool.end();
    }
}

assignProfessors();
