require('dotenv').config({ path: '../.env' }); // Adjust path if running from scripts/
const mongoose = require('mongoose');
const Laboratorio = require('../src/models/Laboratorio');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestor_lab';

console.log('Connecting to:', MONGODB_URI);

const SLOTS = [
    { startTime: '07:00', endTime: '09:00', label: '07:00 - 09:00' },
    { startTime: '09:00', endTime: '11:00', label: '09:00 - 11:00' },
    { startTime: '11:00', endTime: '13:00', label: '11:00 - 13:00' },
    { startTime: '14:00', endTime: '16:00', label: '14:00 - 16:00' },
    { startTime: '16:00', endTime: '18:00', label: '16:00 - 18:00' }
];

const UBICACIONES = ['Edificio A', 'Edificio B', 'Edificio C', 'Edificio de Sistemas', 'Laboratorios Quimica'];
const EQUIPAMIENTO = ['Projector', 'Pizarra Inteligente', 'PCs i7', 'Microscopios', 'Impresora 3D'];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing labs
        await Laboratorio.deleteMany({});
        console.log('🗑️  Cleared existing laboratories');

        const labs = [];
        for (let i = 1; i <= 50; i++) {
            const ubicacion = UBICACIONES[Math.floor(Math.random() * UBICACIONES.length)];
            const capacidad = Math.floor(Math.random() * (40 - 15 + 1)) + 15; // 15 to 40

            // Random equipment (2-3 items)
            const equip = [];
            const shuffled = [...EQUIPAMIENTO].sort(() => 0.5 - Math.random());
            equip.push(...shuffled.slice(0, Math.floor(Math.random() * 2) + 2));

            labs.push({
                nombre: `Laboratorio ${i}`,
                capacidad,
                ubicacion: `${ubicacion} - Aula ${100 + i}`,
                slots: SLOTS,
                estado: 'activo',
                equipamiento: equip
            });
        }

        await Laboratorio.insertMany(labs);
        console.log(`✨ Created ${labs.length} laboratories successfully!`);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected');
        process.exit();
    }
}

seed();
