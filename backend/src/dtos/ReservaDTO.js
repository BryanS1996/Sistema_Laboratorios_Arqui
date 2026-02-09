class ReservaDTO {
  constructor({ id, userId, laboratorio, fecha, horaInicio, horaFin, motivo, subjectId, parallelId, actividad }) {
    this.id = id;
    this.userId = userId;
    this.laboratorio = laboratorio;
    this.fecha = fecha; // YYYY-MM-DD
    this.horaInicio = horaInicio; // HH:mm
    this.horaFin = horaFin; // HH:mm
    this.motivo = motivo;
    this.subjectId = subjectId;
    this.parallelId = parallelId;
    this.actividad = actividad;
  }
}

module.exports = ReservaDTO;
