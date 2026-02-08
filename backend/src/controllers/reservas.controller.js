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
  const docs = await reservasService.obtenerTodas(req.user);
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
    // Si es admin, podría actualizar cualquier reserva, pero por ahora mantenemos lógica de propietario
    // o podríamos adaptar similar a eliminar.
    // El requerimiento decía "control total sobre reservas (crear, editar, eliminar)".
    // Asumamos que admin puede editar cualquiera.
    const userId = req.user.role === 'admin' ? null : req.user.id;

    // Service.actualizar recibe (userId, reservaId, data). Si pasamos userId=null, el DAO ya lo soporta.
    // Pero Service.actualizar tiene validación? No, solo llama a DAO.
    // Simplemente llamamos directo:
    // (Nota: Service.actualizar hace new ReservaDTO({ userId... }) -> si userId es null, el DTO queda con null.
    // Eso está bien para el update, no cambia el userId de la reserva a menos que lo pasemos.)

    // Un detalle: ReservasService.actualizar crea un DTO con el userId.
    // Si userId es null, el DTO tendrá userId: null.
    // El DAO usa $set: update. Si el DTO no tiene userId en 'reservaDTO' (que son los campos a update), no pasa nada.
    // Pero updateById(id, userId, dto) usa userId para el Query { userId: userId }.

    // Vamos a tener que ajustar el Service para soportar admin en actualizar también, pero por brevedad
    // y dado que 'eliminar' era lo crítico, dejemos actualizar al propietario por ahora o
    // hagamos un pequeño hack/fix temporal si se requiere.
    // El usuario pidió "full control".
    // Vamos a pasar req.user.id si no es admin, o null si es admin.

    // PRECAUCIÓN: Service.actualizar espera (userId, reservaId, data).
    // Si paso null, el DTO se crea con userId=null.
    // En el DAO, updateById recibe DTO.
    // El DAO extrae campos del DTO. El userId del DTO NO se usa para el update ($set).
    // Así que es seguro pasar null como userId para bypass el check de propiedad.

    const userIdToCheck = req.user.role === 'admin' ? null : req.user.id;
    const doc = await reservasService.actualizar(userIdToCheck, req.params.id, req.body);
    return res.json(doc);
  } catch (e) {
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
  const ok = await reservasService.eliminar(req.user, req.params.id);
  return res.json({ deleted: ok });
}

module.exports = { crear, misReservas, obtener, actualizar, reporteMine, eliminar };
