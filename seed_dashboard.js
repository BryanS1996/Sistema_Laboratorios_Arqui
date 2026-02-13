
/**
 * Script de Inserción de Datos de Prueba (MongoDB)
 * Genera 100 reservas dinámicas para visualización en el Dashboard
 */

const users = [
    { userId: '1', nombre: 'Abel Smith', email: 'asmith@uce.edu.ec' },
    { userId: '2', nombre: 'Maria Perez', email: 'mperez@uce.edu.ec' },
    { userId: '3', nombre: 'Juan Rodriguez', email: 'jrodriguez@uce.edu.ec' },
    { userId: '4', nombre: 'Admin General', email: 'admin-labs@uce.edu.ec' },
    { userId: '5', nombre: 'Carla Gomez', email: 'cgomez@uce.edu.ec' },
    { userId: '6', nombre: 'Luis Tello', email: 'ltello@uce.edu.ec' },
    { userId: '7', nombre: 'Ana Martinez', email: 'amartinez@uce.edu.ec' },
    { userId: '8', nombre: 'Roberto Canseco', email: 'rcanseco@uce.edu.ec' }
];

const labs = [
    'Laboratorio de Computación 1',
    'Laboratorio de Redes',
    'Laboratorio de Electrónica',
    'Laboratorio de Física',
    'Laboratorio de Química',
    'Sala de Videoconferencias',
    'Laboratorio de IA y Robótica'
];

const timeSlots = [
    { start: '07:00', end: '09:00' },
    { start: '09:00', end: '11:00' },
    { start: '11:00', end: '13:00' },
    { start: '13:00', end: '15:00' },
    { start: '15:00', end: '17:00' },
    { start: '17:00', end: '19:00' },
    { start: '18:30', end: '20:30' }
];

const reasons = [
    'Práctica Libre', 'Examen de Recuperación', 'Taller de Programación',
    'Proyecto Integrador', 'Reunión de Grupo', 'Clase Especial'
];

// Obtener fecha actual y generar fechas para la última semana y la próxima
const getDates = () => {
    const dates = [];
    for (let i = -7; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const dates = getDates();
const db = db.getSiblingDB('gestor_lab');

print('--- Iniciando siembra de datos ---');

// OPCIONAL: Limpiar base de datos si quieres empezar de cero
// db.reservas.deleteMany({});

const payload = [];

for (let i = 0; i < 100; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const lab = labs[Math.floor(Math.random() * labs.length)];
    const slot = timeSlots[Math.floor(Math.random() * timeSlots.slots?.length || Math.random() * timeSlots.length)];
    const date = dates[Math.floor(Math.random() * dates.length)];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    payload.push({
        userId: user.userId,
        nombre: user.nombre,
        email: user.email,
        laboratorio: lab,
        fecha: date,
        horaInicio: slot.start,
        horaFin: slot.end,
        motivo: reason,
        actividad: Math.random() > 0.5 ? 'práctica libre' : 'examen',
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
    });
}

const result = db.reservas.insertMany(payload);
print(`✅ Éxito: Se han insertado ${result.insertedIds.length} reservas diversificadas.`);
print('--- Proceso finalizado ---');
