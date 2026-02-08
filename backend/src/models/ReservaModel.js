const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    laboratorio: { type: String, required: true },
    fecha: { type: String, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    motivo: { type: String, default: "" },
    subjectId: { type: String, required: false }, // Required logic handled in service
    parallelId: { type: String, required: false } // Optional for professors
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reserva", ReservaSchema);
