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
          // Check 10-minute rule
          const createdAt = new Date(conflict.createdAt);
          const now = new Date();
          const diffMinutes = (now - createdAt) / 1000 / 60;

          if (diffMinutes > 10) {
            throw new Error("No se puede reclamar: La reserva del estudiante ya está consolidada (>10 min).");
          }

          // Prioridad: Profesor sobre Estudiante (< 10 min) -> Borrar reserva del estudiante
          await this.reservaDAO.deleteById(conflict._id, conflict.userId);
        } else {
          // Conflicto con otro profesor o admin
          throw new Error("El laboratorio ya está reservado por otro profesor o administrador.");
        }
      }

      // Si es admin, puede sobreescribir
      if (userRole === 'admin') {
        await this.reservaDAO.deleteById(conflict._id, conflict.userId);
      }
    }

    const dto = new ReservaDTO({ ...data, userId });
    return this.reservaDAO.create(dto);
  }

  /**
   * Obtiene todas las reservas para mostrar disponibilidad.
   * - Admin: Ve todo.
   * - Dueño: Ve su reserva completa.
   * - Otros: Ven datos restringidos (fecha, hora, laboratorio, materia, profesor).
   */
  async getAvailability(user) {
    const reservas = await this.reservaDAO.findAll();

    // Instantiate DAOs (Dependencies)
    const SubjectPostgresDAO = require("../daos/postgres/SubjectPostgresDAO");
    const subjectDAO = new SubjectPostgresDAO();
    const UserPostgresDAO = require("../daos/postgres/UserPostgresDAO");
    const userDAO = new UserPostgresDAO();

    const enrichedReservas = await Promise.all(reservas.map(async (r) => {
      const rObj = r.toObject ? r.toObject() : r;

      // 1. Data Enrichment (Subject/Professor)
      let materia = "No especificada";
      let profesor = "No asignado";

      if (rObj.subjectId) {
        try {
          const subject = await subjectDAO.findById(rObj.subjectId);
          if (subject) materia = subject.name;

          const prof = await subjectDAO.getProfessorBySubject(rObj.subjectId);
          if (prof) profesor = prof.nombre;
        } catch (err) {
          console.error("Error enriching reservation:", err.message);
        }
      }

      // 2. User Info (For Admins AND Professors to check priority)
      let usuario = undefined;
      let ownerRole = 'student'; // Default prediction

      if (rObj.userId) {
        const u = await userDAO.findById(rObj.userId);
        if (u) {
          ownerRole = u.role;
          if (user.role === 'admin') {
            usuario = { nombre: u.nombre, email: u.email, role: u.role };
          }
        }
      }

      // 3. Sanitization
      const isOwner = String(rObj.userId) === String(user.id);
      const isAdmin = user.role === 'admin';
      const isProfessor = user.role === 'professor';
      const showDetails = isOwner || isAdmin;

      // Expose ownerRole only to Professors (to know if they can claim) or Admins
      const exposedOwnerRole = (isProfessor || isAdmin) ? ownerRole : undefined;

      return {
        _id: rObj._id,
        userId: rObj.userId, // Always return ID so frontend can check isMine
        laboratorio: rObj.laboratorio,
        fecha: rObj.fecha,
        horaInicio: rObj.horaInicio,
        horaFin: rObj.horaFin,
        motivo: showDetails ? rObj.motivo : 'Reservado', // Mask motif
        actividad: rObj.actividad || 'clase normal',
        materia,  // Public info
        profesor, // Public info
        usuario,  // Only admin
        subjectId: rObj.subjectId,
        createdAt: rObj.createdAt, // For 10-min rule check on frontend
        ownerRole: exposedOwnerRole // For priority check
      };
    }));

    return enrichedReservas;
  }

  // Legacy support or specific use
  async obtenerTodas(user) {
    return this.getAvailability(user);
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

  /** Actualiza una reserva. Admin puede editar cualquiera. */
  async actualizar(user, reservaId, data) {
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

    const userIdToCheck = user.role === 'admin' ? null : user.id;

    // El DTO lleva los datos a actualizar. No cambiamos el userId.
    const dto = new ReservaDTO({ ...data });

    // Si queremos preservar el userId en el DTO por validación del DAO, 
    // podríamos necesitarlo, pero el DAO solo usa los campos definidos en DTO para $set.
    // ReservaDTO constructor filters fields? Let's assume it just assigns.

    const updated = await this.reservaDAO.updateById(reservaId, userIdToCheck, dto);
    if (!updated) throw new Error("Reserva no encontrada o no tienes permiso");
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
