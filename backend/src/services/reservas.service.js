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

  async crear(user, data) {
    const userId = user.id;
    const userRole = user.role || 'student';

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

    // --- Lógica de Prioridad y Conflictos ---
    const conflicts = await this.reservaDAO.findOverlapping(laboratorio, fecha, horaInicio, horaFin);

    for (const conflict of conflicts) {
      // Obtener rol del dueño de la reserva conflictiva
      const owner = await this.userDAO.findById(conflict.userId);
      // Si no existe el usuario dueño (raro), asumimos que es estudiante o borramos
      const ownerRole = owner ? owner.role : 'student';

      if (userRole === 'student') {
        throw new Error("El laboratorio ya está reservado en ese horario.");
      }

      if (userRole === 'professor') {
        if (ownerRole === 'student') {
          // Prioridad: Profesor sobre Estudiante -> Borrar reserva del estudiante
          // TODO: Notificar al estudiante?
          await this.reservaDAO.deleteById(conflict._id, conflict.userId);
        } else {
          // Conflicto con otro profesor o admin
          throw new Error("El laboratorio ya está reservado por otro profesor o administrador.");
        }
      }

      // Si es admin, puede sobreescribir (asumimos comportamiento similar a profesor o total)
      if (userRole === 'admin') {
        await this.reservaDAO.deleteById(conflict._id, conflict.userId);
      }
    }

    const dto = new ReservaDTO({ ...data, userId });
    return this.reservaDAO.create(dto);
  }

  async obtenerTodas(user) {
    if (user.role === 'admin') {
      const reservas = await this.reservaDAO.findAll();

      // Enrich with user info
      // 1. Get unique user IDs
      const userIds = [...new Set(reservas.map(r => r.userId))];

      // 2. Fetch users from Postgres
      // We need a method in UserDAO to find multiple by ID, or loop findById (cache it)
      // optimization: loop for now as we don't have findByIds
      const usersMap = {};
      for (const uid of userIds) {
        if (uid) {
          const u = await this.userDAO.findById(uid);
          if (u) usersMap[uid] = u;
        }
      }

      // 3. Attach
      return reservas.map(r => {
        const rObj = r.toObject ? r.toObject() : r;
        const u = usersMap[r.userId];
        return {
          ...rObj,
          usuario: u ? { nombre: u.nombre, email: u.email, role: u.role } : { nombre: 'Desconocido' }
        };
      });
    }
    return this.reservaDAO.findByUser(user.id);
  }

  // Se mantiene por compatibilidad, pero preferir usar obtenerTodas
  async misReservas(userId) {
    return this.reservaDAO.findByUser(userId);
  }

  async eliminar(user, reservaId) {
    const userIdToCheck = user.role === 'admin' ? null : user.id;
    return this.reservaDAO.deleteById(reservaId, userIdToCheck);
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
