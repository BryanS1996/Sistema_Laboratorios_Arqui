const ReservaDTO = require("../dtos/ReservaDTO");
const ReservaUsuarioDTO = require("../dtos/ReservaUsuarioDTO");
const { getFactory } = require("../factories");
const { isPastDate, isValidTimeRange } = require("../utils/validators");

class ReservasService {
  constructor() {
    const factory = getFactory();
    this.reservaDAO = factory.createReservaDAO();
    this.userDAO = factory.createUserDAO();
  }

  async crear(userId, data) {
    const { laboratorio, fecha, horaInicio, horaFin } = data;
    if (!laboratorio || !fecha || !horaInicio || !horaFin) {
      throw new Error("Faltan campos: laboratorio, fecha, horaInicio, horaFin");
    }

    // Evita crear reservas en fechas anteriores
    if (isPastDate(fecha)) {
      throw new Error("No se pueden crear reservas en fechas anteriores");
    }

    // Validación del rango de horas (fin debe ser mayor a inicio)
    if (!isValidTimeRange(horaInicio, horaFin)) {
      throw new Error("Rango de horas inválido (horaFin debe ser mayor a horaInicio)");
    }

    const dto = new ReservaDTO({ ...data, userId });
    return this.reservaDAO.create(dto);
  }

  async misReservas(userId) {
    return this.reservaDAO.findByUser(userId);
  }

  async eliminar(userId, reservaId) {
    return this.reservaDAO.deleteById(reservaId, userId);
  }

  /** Obtiene una reserva específica del usuario autenticado. */
  async obtener(userId, reservaId) {
    const doc = await this.reservaDAO.findById(reservaId, userId);
    if (!doc) throw new Error("Reserva no encontrada");
    return doc;
  }

  /** Actualiza una reserva del usuario autenticado. */
  async actualizar(userId, reservaId, data) {
    const { laboratorio, fecha, horaInicio, horaFin } = data;

    // Solo validamos lo que viene en el body (update parcial)
    if (fecha && isPastDate(fecha)) {
      throw new Error("No se pueden asignar fechas anteriores");
    }
    if ((horaInicio || horaFin) && !(horaInicio && horaFin)) {
      throw new Error("Para actualizar horas, debes enviar horaInicio y horaFin");
    }
    if (horaInicio && horaFin && !isValidTimeRange(horaInicio, horaFin)) {
      throw new Error("Rango de horas inválido (horaFin debe ser mayor a horaInicio)");
    }

    const dto = new ReservaDTO({ userId, laboratorio, fecha, horaInicio, horaFin, motivo: data.motivo });
    const updated = await this.reservaDAO.updateById(reservaId, userId, dto);
    if (!updated) throw new Error("Reserva no encontrada");
    return updated;
  }

  /**
   * Reporte combinado Usuario (Postgres) + Reservas (Mongo).
   * Resuelve el requerimiento de un DTO combinado de user + reservas.
   */
  async reporteMisReservas(userId) {
    const user = await this.userDAO.findById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    const reservas = await this.reservaDAO.findByUser(userId);
    return reservas.map((r) => new ReservaUsuarioDTO(user, r));
  }
}

module.exports = new ReservasService();
