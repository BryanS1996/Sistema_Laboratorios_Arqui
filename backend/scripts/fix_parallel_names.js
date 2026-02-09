const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://lab:lab@postgres:5432/labdb'
});

async function fixParallels() {
    try {
        console.log('Starting parallel name standardization...');

        // 1. Get all subjects joined with semesters to get the LEVEL
        const { rows: subjects } = await pool.query(`
            SELECT s.id as subject_id, s.name as subject_name, sem.level 
            FROM subjects s 
            JOIN semesters sem ON s.semester_id = sem.id
        `);

        console.log(`Found ${subjects.length} subjects.`);

        for (const subject of subjects) {
            // 2. Get parallels for each subject
            const { rows: parallels } = await pool.query(`
                SELECT id, name FROM parallels 
                WHERE subject_id = $1 
                ORDER BY name, id
            `, [subject.subject_id]);

            if (parallels.length === 0) continue;

            let counter = 1;
            for (const parallel of parallels) {
                // Format: SI{Level}-{00N}
                // Example: Level 1, Counter 1 -> SI1-001
                const numberStr = String(counter).padStart(3, '0');
                const newName = `SI${subject.level}-${numberStr}`;

                if (parallel.name !== newName) {
                    console.log(`[${subject.subject_name}] Renaming ${parallel.name} -> ${newName}`);
                    await pool.query('UPDATE parallels SET name = $1 WHERE id = $2', [newName, parallel.id]);
                }
                counter++;
            }
        }

        console.log('Standardization complete.');
    } catch (error) {
        console.error('Error fixing parallels:', error);
    } finally {
        await pool.end();
    }
}

fixParallels();
