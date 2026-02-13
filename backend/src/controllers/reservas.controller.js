const reservasService = require("../services/reservas.service");
const AuditService = require("../services/audit.service");

/**
 * Controlador de reservas.
 *
 * Importante: toda validación/reglas de negocio están en el Service;
 * el Controller solo orquesta HTTP (req/res).
 */

async function crear(req, res) {
  try {
    const doc = await reservasService.crear(req.user, req.body);

    // Auditar creación de reserva
    await AuditService.log(
      req.user.id,
      AuditService.ACTIONS.CREATE_RESERVA,
      'reserva',
      doc._id || doc.id,
      { laboratorio: req.body.laboratorio, fecha: req.body.fecha, horaInicio: req.body.horaInicio },
      req
    );

    return res.status(201).json(doc);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function listarDisponibilidad(req, res) {
  try {
    const docs = await reservasService.getAvailability(req.user);
    return res.json(docs);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

async function misReservas(req, res) {
  // Ahora misReservas trae SOLO las del usuario, sin importar rol, para la vista "Mis Reservas"
  const docs = await reservasService.misReservas(req.user.id);
  // Podríamos querer enriquecerlas también? Sí, mejor usamos getAvailability pero filtrando?
  // O mejor, actualizamos misReservas en servicio para enriquecer.
  // Por ahora, para "Mis Reservas" el usuario quiere ver su historial.
  // Si usamos misReservas del DAO, falta la info de Materia.
  // Reutilicemos getAvailability y filtremos en memoria o en servicio.

  // Opción rápida: Usar getAvailability y filtrar.
  const all = await reservasService.getAvailability(req.user);
  const mine = all.filter(r => String(r.userId) === String(req.user.id));
  return res.json(mine);
}

async function obtener(req, res) {
  try {
    const doc = await reservasService.obtener(req.user.id, req.params.id);
    return res.json(doc);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
}

async function actualizar(req, res) {
  try {
    // Pasamos el usuario completo para que el servicio decida si permite la edición (Admin vs Owner)
    const doc = await reservasService.actualizar(req.user, req.params.id, req.body);

    // Auditar actualización de reserva
    await AuditService.log(
      req.user.id,
      AuditService.ACTIONS.UPDATE_RESERVA,
      'reserva',
      req.params.id,
      { updates: Object.keys(req.body) },
      req
    );

    return res.json(doc);
  } catch (e) {
    const status = e.message.includes("no encontrada") || e.message.includes("permiso") ? 404 : 400;
    return res.status(status).json({ message: e.message });
  }
}

async function reporteMine(req, res) {
  try {
    const data = await reservasService.reporteMisReservas(req.user.id);
    return res.json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function eliminar(req, res) {
  const ok = await reservasService.eliminar(req.user, req.params.id);

  // Auditar eliminación de reserva
  if (ok) {
    await AuditService.log(
      req.user.id,
      AuditService.ACTIONS.DELETE_RESERVA,
      'reserva',
      req.params.id,
      {},
      req
    );
  }

  return res.json({ deleted: ok });
}

module.exports = { crear, misReservas, obtener, actualizar, reporteMine, eliminar, listarDisponibilidad };
