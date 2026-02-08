const mongoose = require('mongoose');

const laboratorioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    capacidad: {
        type: Number,
        required: true
    },
    ubicacion: {
        type: String,
        required: true
    },
    slots: [{
        startTime: String, // '07:00'
        endTime: String,   // '09:00'
        label: String      // '07:00 - 09:00'
    }],
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'mantenimiento'],
        default: 'activo'
    },
    equipamiento: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('Laboratorio', laboratorioSchema);
