const ReservaDAO = require("../interfaces/ReservaDAO");
const { connectMongo } = require("../../config/mongo");
const ReservaModel = require("../../models/ReservaModel");

class ReservaMongoDAO extends ReservaDAO {
  /**
   * Crea una nueva reserva en Mongo.
   * Toda la persistencia queda encapsulada en el DAO.
   */
  async create(reservaDTO) {
    await connectMongo();
    const doc = await ReservaModel.create({
      userId: reservaDTO.userId,
      laboratorio: reservaDTO.laboratorio,
      fecha: reservaDTO.fecha,
      horaInicio: reservaDTO.horaInicio,
      horaFin: reservaDTO.horaFin,
      motivo: reservaDTO.motivo,
    });
    return doc;
  }

  async findByUser(userId) {
    await connectMongo();
    return ReservaModel.find({ userId }).sort({ createdAt: -1 });
  }

  /** Busca una reserva por id y userId para evitar exponer reservas ajenas. */
  async findById(id, userId) {
    await connectMongo();
    return ReservaModel.findOne({ _id: id, userId });
  }

  async findAll() {
    await connectMongo();
    return ReservaModel.find({}).sort({ createdAt: -1 });
  }

  /** Actualiza una reserva por id y userId (update parcial). Si userId es null, actualiza cualquiera (admin). */
  async updateById(id, userId, reservaDTO) {
    await connectMongo();
    const update = {};

    // Solo aplicamos campos definidos
    if (reservaDTO.laboratorio !== undefined) update.laboratorio = reservaDTO.laboratorio;
    if (reservaDTO.fecha !== undefined) update.fecha = reservaDTO.fecha;
    if (reservaDTO.horaInicio !== undefined) update.horaInicio = reservaDTO.horaInicio;
    if (reservaDTO.horaFin !== undefined) update.horaFin = reservaDTO.horaFin;
    if (reservaDTO.motivo !== undefined) update.motivo = reservaDTO.motivo;

    const query = { _id: id };
    if (userId) query.userId = userId;

    const doc = await ReservaModel.findOneAndUpdate(
      query,
      { $set: update },
      { new: true }
    );
    return doc;
  }

  async deleteById(id, userId) {
    await connectMongo();
    const query = { _id: id };
    if (userId) query.userId = userId;
    const r = await ReservaModel.deleteOne(query);
    return r.deletedCount === 1;
  }

  /**
   * Encuentra reservas que solapen con el horario dado para un laboratorio específico.
   * Retorna una lista de reservas conflictivas.
   */
  async findOverlapping(laboratorio, fecha, horaInicio, horaFin) {
    await connectMongo();
    // Solapamiento: (StartA < EndB) && (EndA > StartB)
    return ReservaModel.find({
      laboratorio,
      fecha,
      $and: [
        { horaInicio: { $lt: horaFin } },
        { horaFin: { $gt: horaInicio } }
      ]
    });
  }
}

module.exports = ReservaMongoDAO;
