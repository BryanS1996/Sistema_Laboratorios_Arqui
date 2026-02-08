const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: String, // Firebase UID / Firestore ID
        required: [true, 'El ID de usuario es obligatorio']
    },
    userEmail: {
        type: String,
        required: true
    },
    laboratorio: {
        type: String,
        required: [true, 'El laboratorio es obligatorio'],
        trim: true
    },
    reportType: {
        type: String,
        enum: ['daño', 'incidente', 'mantenimiento', 'otro'],
        default: 'daño'
    },
    title: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true,
        maxlength: [100, 'El título no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        trim: true,
        maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    severity: {
        type: String,
        enum: ['baja', 'media', 'alta', 'crítica'],
        default: 'baja'
    },
    status: {
        type: String,
        enum: ['enviado', 'en_revisión', 'resuelto', 'rechazado'],
        default: 'enviado'
    },
    imageUrl: {
        type: String // URL from Backblaze B2
    },
    imageId: {
        type: String // File ID from Backblaze B2 (for deletion)
    },
    assignedTo: {
        type: String // Admin user ID
    },
    resolution: {
        type: String
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ laboratorio: 1 });

module.exports = mongoose.model('Report', reportSchema);
