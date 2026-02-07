const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    laboratorio: { type: String, required: true },
    fecha: { type: String, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    motivo: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reserva", ReservaSchema);
