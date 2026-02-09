const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://lab:lab@postgres:5432/labdb'
});

async function normalizeParallels() {
    try {
        console.log('Starting parallel normalization for Semesters 1 & 2...');

        // 1. Get subjects in Semester 1 (Level 1) and Semester 2 (Level 2)
        const { rows: subjects } = await pool.query(`
            SELECT s.id as subject_id, s.name as subject_name, sem.level 
            FROM subjects s 
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE sem.level IN (1, 2)
        `);

        console.log(`Found ${subjects.length} subjects in Semesters 1 & 2.`);

        for (const subject of subjects) {
            const level = subject.level;
            // Target: 3 parallels per subject
            const targets = [
                `SI${level}-001`,
                `SI${level}-002`,
                `SI${level}-003`
            ];

            for (const targetName of targets) {
                // Check if exists
                const { rows: existing } = await pool.query(`
                    SELECT id FROM parallels 
                    WHERE subject_id = $1 AND name = $2
                `, [subject.subject_id, targetName]);

                if (existing.length === 0) {
                    console.log(`[${subject.subject_name}] Creating parallel ${targetName}`);
                    await pool.query(
                        'INSERT INTO parallels (name, subject_id) VALUES ($1, $2)',
                        [targetName, subject.subject_id]
                    );
                } else {
                    // console.log(`[${subject.subject_name}] Parallel ${targetName} already exists.`);
                }
            }
        }

        console.log('Normalization complete.');
    } catch (error) {
        console.error('Error normalizing parallels:', error);
    } finally {
        await pool.end();
    }
}

normalizeParallels();
