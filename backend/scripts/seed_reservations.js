const mongoose = require('mongoose');
const { Pool } = require('pg');
require('dotenv').config();

// Configurar conexiones
const pool = new Pool({
    user: process.env.PG_USER || 'lab',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'labdb',
    password: process.env.PG_PASSWORD || 'lab',
    port: process.env.PG_PORT || 5432,
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gestor_lab';

// Modelo Mongoose (Simplificado para el script)
const ReservaSchema = new mongoose.Schema({
    userId: String,
    laboratorio: String,
    fecha: String,
    horaInicio: String,
    horaFin: String,
    motivo: String,
    subjectId: String,
    parallelId: String
}, { timestamps: true });

const Reserva = mongoose.model('Reserva', ReservaSchema);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
    try {
        console.log('Connecting to databases...');
        await mongoose.connect(MONGO_URI);

        // Clear existing reservations
        console.log('Clearing existing reservations...');
        await Reserva.deleteMany({});
        console.log('Reservations cleared.');

        // 1. Get Labs
        const labsRes = await pool.query('SELECT * FROM laboratories');
        const labs = labsRes.rows;

        // 2. Get Subjects with Professors (for enrichment to work)
        const subjectsRes = await pool.query(`
            SELECT s.id, s.name 
            FROM subjects s
            JOIN professor_assignments pa ON pa.subject_id = s.id
        `);
        const subjects = subjectsRes.rows;

        // 3. Get a Student user
        const studentsRes = await pool.query("SELECT id FROM users WHERE role='student' LIMIT 1");
        const student = studentsRes.rows[0];

        if (!student) {
            console.error('No student found to assign reservations to.');
            process.exit(1);
        }

        if (subjects.length === 0) {
            console.error('No subjects with professors found.');
            // Continue but without subjectId? No, user wants enrichment.
        }

        console.log(`Found ${labs.length} labs, ${subjects.length} subjects, student ID: ${student.id}`);

        // Dates: Next 7 days
        const today = new Date();

        for (const lab of labs) {
            const count = getRandomInt(0, 3);
            console.log(`Creating ${count} reservations for ${lab.nombre}`);

            for (let i = 0; i < count; i++) {
                const daysToAdd = getRandomInt(1, 14);
                const date = new Date(today);
                date.setDate(date.getDate() + daysToAdd);
                const dateStr = date.toISOString().split('T')[0];

                // Random Time (07:00 to 17:00)
                const startHour = getRandomInt(7, 16);
                const endHour = startHour + 2;
                const horaInicio = `${startHour.toString().padStart(2, '0')}:00`;
                const horaFin = `${endHour.toString().padStart(2, '0')}:00`;

                // Random Subject
                const subject = getRandomItem(subjects);

                await Reserva.create({
                    userId: String(student.id),
                    laboratorio: lab.nombre, // We store name in Mongo currently
                    fecha: dateStr,
                    horaInicio,
                    horaFin,
                    motivo: 'Práctica Generada Automáticamente',
                    subjectId: subject ? String(subject.id) : null
                });
            }
        }

        console.log('Seeding completed successfully.');

    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await mongoose.disconnect();
        await pool.end();
    }
}

seed();
