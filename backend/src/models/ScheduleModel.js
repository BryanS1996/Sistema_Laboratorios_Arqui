const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    parallelId: { type: String, required: true },
    labId: { type: String, required: true },
    dia: { type: String, required: true, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'] },
    horaInicio: { type: String, required: true }, // HH:MM
    horaFin: { type: String, required: true },   // HH:MM

    // Denormalized fields for easier querying/display without heavy joins
    labName: { type: String },
    subjectName: { type: String },
    parallelName: { type: String },

    // firebaseUid removed
}, { timestamps: true });

// Compound index to quickly find conflicts
ScheduleSchema.index({ labId: 1, dia: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);
