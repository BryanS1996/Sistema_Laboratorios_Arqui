/**
 * DTO combinado Usuario + Reserva.
 *
 * Se usa para reportes donde se necesita mezclar información del usuario
 * (almacenado en Postgres) con la reserva (almacenada en Mongo).
 */
class ReservaUsuarioDTO {
  constructor(user, reserva) {
    // Datos del usuario (Postgres)
    this.userId = user.id;
    this.nombre = user.nombre;
    this.email = user.email;

    // Datos de la reserva (Mongo)
    this.reservaId = String(reserva._id || reserva.id || "");
    this.laboratorio = reserva.laboratorio;
    this.fecha = reserva.fecha;
    this.horaInicio = reserva.horaInicio;
    this.horaFin = reserva.horaFin;
    this.motivo = reserva.motivo;

    // Meta: fecha de creación si existe
    this.createdAt = reserva.createdAt;
  }
}

module.exports = ReservaUsuarioDTO;
