const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://lab:lab@postgres:5432/labdb'
});

async function normalizeUpperLevels() {
    try {
        console.log('Starting upper level normalization (Levels 6-10)...');

        // Get subjects for levels 6 to 10
        const { rows: subjects } = await pool.query(`
            SELECT s.id as subject_id, s.name as subject_name, sem.level 
            FROM subjects s 
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE sem.level >= 6
            ORDER BY sem.level, s.name
        `);

        for (const subject of subjects) {
            // Determine target max based on level
            let targetMax = 2;
            if (subject.level === 7) {
                targetMax = 1;
            }

            // Fetch current parallels
            const { rows: parallels } = await pool.query(`
                SELECT id, name FROM parallels 
                WHERE subject_id = $1 
                ORDER BY name
            `, [subject.subject_id]);

            const currentCount = parallels.length;

            // Logic:
            // 1. If count > targetMax, delete excess.
            // 2. If count == 0, create 1 (SI{L}-001).

            if (currentCount > targetMax) {
                console.log(`[${subject.subject_name}] Level ${subject.level}: Reducing ${currentCount} -> ${targetMax}`);

                // Keep the first N (0 to targetMax-1)
                const keepIds = parallels.slice(0, targetMax).map(p => p.id);
                const removeIds = parallels.slice(targetMax).map(p => p.id);
                const removeNames = parallels.slice(targetMax).map(p => p.name);

                console.log(`   Removing: ${removeNames.join(', ')}`);

                for (const id of removeIds) {
                    try {
                        await pool.query('DELETE FROM parallels WHERE id=$1', [id]);
                    } catch (e) {
                        console.log(`   Failed to delete parallel (likely in use): ${e.message}`);
                    }
                }
            } else if (currentCount === 0) {
                // Should have at least one
                const name = `SI${subject.level}-001`;
                console.log(`[${subject.subject_name}] Level ${subject.level}: Creating default ${name}`);
                await pool.query('INSERT INTO parallels (name, subject_id) VALUES ($1, $2)', [name, subject.subject_id]);
            } else {
                // console.log(`[${subject.subject_name}] Level ${subject.level}: OK (${currentCount})`);
            }
        }

        console.log('Upper level normalization complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

normalizeUpperLevels();
