const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://lab:lab@postgres:5432/labdb'
});

async function optimizeParallels() {
    try {
        console.log('Starting parallel optimization...');

        const { rows: subjects } = await pool.query(`
            SELECT s.id as subject_id, s.name as subject_name, sem.level 
            FROM subjects s 
            JOIN semesters sem ON s.semester_id = sem.id
            WHERE sem.level >= 3 -- Apply logic from 3rd semester onwards
            ORDER BY sem.level, s.name
        `);

        for (const subject of subjects) {
            const name = subject.subject_name.toLowerCase();
            let targetCount = 2; // Default

            // Heuristics
            if (
                name.includes('ecuaciones') ||
                name.includes('probabilidades') ||
                name.includes('cálculo') ||
                name.includes('física') ||
                name.includes('arquitectura') ||
                name.includes('sistemas operativos') ||
                name.includes('base de datos') ||
                name.includes('programación') ||
                name.includes('estructura')
            ) {
                targetCount = 3;
            }

            if (
                name.includes('liderazgo') ||
                name.includes('sociedad') ||
                name.includes('ecología') ||
                name.includes('comunicación') ||
                name.includes('ética') ||
                name.includes('realidad')
            ) {
                targetCount = 2; // Keep at 2 for lighter subjects
            }

            // Exceptions/Overrides specifically mentioned or implied
            // "Arqui... 4 cursos and EDO 1" -> Arqui should be 3, EDO 3.

            // Fetch current parallels
            const { rows: parallels } = await pool.query(`
                SELECT id, name FROM parallels 
                WHERE subject_id = $1 
                ORDER BY name
            `, [subject.subject_id]);

            const currentCount = parallels.length;
            console.log(`[${subject.subject_name}] Level ${subject.level}: Current ${currentCount} -> Target ${targetCount}`);

            if (currentCount < targetCount) {
                // Create missing
                for (let i = 1; i <= targetCount; i++) {
                    const targetName = `SI${subject.level}-${String(i).padStart(3, '0')}`;
                    const exists = parallels.find(p => p.name === targetName);
                    if (!exists) {
                        console.log(`   Creating ${targetName}`);
                        await pool.query('INSERT INTO parallels (name, subject_id) VALUES ($1, $2)', [targetName, subject.subject_id]);
                    }
                }
            } else if (currentCount > targetCount) {
                // Remove excess
                // Identify parallels that exceed the count or don't match pattern
                // We keep SI{L}-001 to SI{L}-{Target}
                const keepNames = [];
                for (let i = 1; i <= targetCount; i++) {
                    keepNames.push(`SI${subject.level}-${String(i).padStart(3, '0')}`);
                }

                for (const p of parallels) {
                    if (!keepNames.includes(p.name)) {
                        console.log(`   Removing excess/invalid parallel: ${p.name}`);
                        // Check if used? (Foreign keys might prevent deletion if used, but we are in setup phase)
                        // Using DELETE ... CASCADE logic? Or catching error.
                        try {
                            await pool.query('DELETE FROM parallels WHERE id=$1', [p.id]);
                        } catch (e) {
                            console.log(`   Failed to delete ${p.name} (likely in use): ${e.message}`);
                        }
                    }
                }
            }
        }

        console.log('Optimization complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

optimizeParallels();
