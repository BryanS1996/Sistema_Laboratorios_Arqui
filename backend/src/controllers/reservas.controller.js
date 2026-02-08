const reservasService = require("../services/reservas.service");

/**
 * Controlador de reservas.
 *
 * Importante: toda validación/reglas de negocio están en el Service;
 * el Controller solo orquesta HTTP (req/res).
 */

async function crear(req, res) {
  try {
    const doc = await reservasService.crear(req.user, req.body);
    return res.status(201).json(doc);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
}

async function misReservas(req, res) {
  const docs = await reservasService.misReservas(req.user.id);
  return res.json(docs);
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
    const doc = await reservasService.actualizar(req.user.id, req.params.id, req.body);
    return res.json(doc);
  } catch (e) {
    // Si la reserva no existe => 404, si es error de validación => 400
    const status = e.message === "Reserva no encontrada" ? 404 : 400;
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
  const ok = await reservasService.eliminar(req.user.id, req.params.id);
  return res.json({ deleted: ok });
}

module.exports = { crear, misReservas, obtener, actualizar, reporteMine, eliminar };
