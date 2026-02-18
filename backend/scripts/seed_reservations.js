const mongoose = require('mongoose');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// Configurar conexiones
const pool = new Pool({
    user: process.env.PG_USER || 'lab',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'labdb',
    password: process.env.PG_PASSWORD || 'lab',
    port: process.env.PG_PORT || 5432,
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gestor_lab';

// Modelo Mongoose
const ReservaSchema = new mongoose.Schema({
    userId: String,
    laboratorio: String,
    fecha: String,
    horaInicio: String,
    horaFin: String,
    motivo: String,
    subjectId: String,
    parallelId: String,
    actividad: String
}, { timestamps: true });

const Reserva = mongoose.model('Reserva', ReservaSchema);

// Datos realistas
const MOTIVOS = [
    'Práctica de laboratorio',
    'Examen práctico',
    'Proyecto de investigación',
    'Clase teórico-práctica',
    'Taller de capacitación',
    'Sesión de trabajo colaborativo',
    'Prácticas de programación',
    'Laboratorio de química',
    'Análisis de datos',
    'Diseño de prototipos',
    'Sesión de debugging',
    'Desarrollo de prototipos'
];

const ACTIVIDADES = ['clase normal', 'evaluación', 'investigación', 'taller', 'sesión especial'];

const HORARIOS = [
    { inicio: '07:00', fin: '09:00' },
    { inicio: '09:00', fin: '11:00' },
    { inicio: '11:00', fin: '13:00' },
    { inicio: '14:00', fin: '16:00' },
    { inicio: '16:00', fin: '18:00' }
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

async function seed() {
    try {
        console.log('\n🚀 GENERADOR DE RESERVAS PARA DASHBOARD\n');
        
        console.log('📡 Conectando a bases de datos...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Limpiar reservas existentes
        console.log('🗑️  Limpiando reservas existentes...');
        const deletedResult = await Reserva.deleteMany({});
        console.log(`✅ ${deletedResult.deletedCount} reservas eliminadas\n`);

        // 1. Obtener laboratorios
        console.log('📍 Obteniendo laboratorios...');
        const labsRes = await pool.query('SELECT id, nombre FROM laboratories LIMIT 20');
        const labs = labsRes.rows;
        console.log(`✅ ${labs.length} laboratorios encontrados`);

        if (labs.length === 0) {
            console.error('❌ No se encontraron laboratorios');
            process.exit(1);
        }

        // 2. Obtener materias
        console.log('\n📚 Obteniendo materias...');
        const subjectsRes = await pool.query('SELECT id, name FROM subjects LIMIT 15');
        const subjects = subjectsRes.rows;
        console.log(`✅ ${subjects.length} materias encontradas`);

        // 3. Obtener múltiples usuarios
        console.log('\n👥 Obteniendo usuarios...');
        const usersRes = await pool.query(`
            SELECT id, email, nombre, role 
            FROM users 
            WHERE role IN ('student', 'professor', 'admin')
            LIMIT 50
        `);
        const users = usersRes.rows;
        console.log(`✅ ${users.length} usuarios encontrados`);

        if (users.length === 0) {
            console.error('❌ No se encontraron usuarios');
            process.exit(1);
        }

        // Separar usuarios por rol
        const students = users.filter(u => u.role === 'student');
        const professors = users.filter(u => u.role === 'professor' || u.role === 'admin');
        console.log(`   Estudiantes: ${students.length}, Profesores/Admin: ${professors.length}`);

        // 4. Generar reservas
        console.log('\n📅 Generando reservas....\n');
        let totalReservas = 0;
        const today = new Date();

        for (const lab of labs) {
            // 15-25 reservas por laboratorio (mucho más visible)
            const reservasPorLab = getRandomInt(15, 25);

            for (let i = 0; i < reservasPorLab; i++) {
                // Fecha futura (1-30 días)
                const daysToAdd = getRandomInt(1, 30);
                const fecha = addDays(today, daysToAdd);
                const fechaStr = fecha.toISOString().split('T')[0];

                // Usuario aleatorio (70% estudiantes, 30% profesores)
                const usuariosList = Math.random() < 0.7 ? students : professors;
                const usuario = getRandomItem(usuariosList);

                // Horario aleatorio
                const horario = getRandomItem(HORARIOS);

                // Materia aleatoria
                const materia = subjects.length > 0 ? getRandomItem(subjects) : null;

                await Reserva.create({
                    userId: String(usuario.id),
                    laboratorio: lab.nombre,
                    fecha: fechaStr,
                    horaInicio: horario.inicio,
                    horaFin: horario.fin,
                    motivo: getRandomItem(MOTIVOS),
                    actividad: getRandomItem(ACTIVIDADES),
                    subjectId: materia ? String(materia.id) : null,
                    parallelId: null
                });

                totalReservas++;
            }

            console.log(`✅ ${reservasPorLab} reservas → ${lab.nombre}`);
        }

        console.log(`\n🎉 ¡ÉXITO! Se crearon ${totalReservas} reservas\n`);
        console.log('📊 Resumen:');
        console.log(`   - Laboratorios: ${labs.length}`);
        console.log(`   - Usuarios: ${users.length}`);
        console.log(`   - Total reservas: ${totalReservas}`);
        console.log(`   - Promedio por lab: ${(totalReservas / labs.length).toFixed(1)}\n`);
        console.log('✨ Las reservas ahora son visibles en el dashboard admin\n');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        await pool.end();
        console.log('👋 Desconectado\n');
    }
}

seed();
