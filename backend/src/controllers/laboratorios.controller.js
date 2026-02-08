const Laboratorio = require("../models/Laboratorio");
const ReservaDAO = require("../daos/mongo/ReservaMongoDAO"); // Assuming MongoDAO is used for Reservas
// Actually, I should use the Service or Factory to get DAO, but for now let's use the Model directly or Factory.
// Let's use the Factory pattern if possible, or just require the Model if simple.
// Given strict architecture, I should use ReservaService or DAO. 
// But Reservas are in Mongo (mostly).
const Reserva = require("../models/ReservaModel");

async function listar(req, res) {
    try {
        const labs = await Laboratorio.find().sort({ nombre: 1 });
        res.json(labs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function obtener(req, res) {
    try {
        const lab = await Laboratorio.findById(req.params.id);
        if (!lab) return res.status(404).json({ message: "Laboratorio no encontrado" });
        res.json(lab);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function disponibilidad(req, res) {
    try {
        const { id } = req.params;
        const { fecha } = req.query;
        if (!fecha) return res.status(400).json({ message: "Fecha requerida" });

        const lab = await Laboratorio.findById(id);
        if (!lab) return res.status(404).json({ message: "Laboratorio no encontrado" });

        // Find reservations for this lab and date
        // Note: 'laboratorio' in ReservaModel is currently a String name, NOT ObjectId.
        // Standardize: if lab.nombre is unique, we search by name? 
        // The Seed script created labs with unique names "Laboratorio X".
        // The frontend sends 'laboratorio' string in CREATE. 
        // So we must search by lab.nombre.

        const reservas = await Reserva.find({
            laboratorio: lab.nombre, // Match by name as per current schema
            fecha: fecha
        }).select('horaInicio horaFin');

        res.json({
            laboratorio: lab.nombre,
            fecha,
            reservas // Returns array of { horaInicio, horaFin }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { listar, obtener, disponibilidad };
