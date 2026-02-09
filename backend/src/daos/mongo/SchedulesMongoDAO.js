const ScheduleModel = require('../../models/ScheduleModel');

class SchedulesMongoDAO {
    async create(data) {
        // Data likely comes with camelCase from Service
        // We might need to fetch names if they aren't provided, 
        // but for now let's assume the Service or Controller passes what's needed
        // or we just store metadata if available. 
        // Actually, the Service just passes IDs. We should ideally fetch names 
        // to populate the denormalized fields, OR we rely on lookups.
        // Given existing architecture, let's keep it simple and just store IDs first.

        return await ScheduleModel.create({
            parallelId: data.parallelId,
            labId: data.labId,
            dia: data.dia,
            horaInicio: data.horaInicio,
            horaFin: data.horaFin,
            // Optional denormalization can be added later in Service
            labName: data.labName,
            subjectName: data.subjectName,
            parallelName: data.parallelName
        });
    }

    async findConflicts(labId, dia, horaInicio, horaFin) {
        // MongoDB query for time overlap
        // (StartA < EndB) and (EndA > StartB)
        return await ScheduleModel.find({
            labId: String(labId), // Ensure type consistency
            dia: dia,
            horaInicio: { $lt: horaFin },
            horaFin: { $gt: horaInicio }
        });
    }

    async findByParallel(parallelId) {
        // Return plain objects. If we need "lab_name" property to match old Postgres DTO,
        // we can map it here.
        const docs = await ScheduleModel.find({ parallelId: String(parallelId) }).lean();
        return docs.map(this._mapToDTO);
    }

    async findByLab(labId) {
        const docs = await ScheduleModel.find({ labId: String(labId) }).lean();
        return docs.map(this._mapToDTO);
    }

    async findAll() {
        const docs = await ScheduleModel.find().lean();
        return docs.map(this._mapToDTO);
    }

    async delete(id) {
        await ScheduleModel.findByIdAndDelete(id);
    }

    // Helper to match the interface expected by frontend/service (snake_case vs camelCase)
    // The previous Postgres DAO returned snake_case columns (lab_id, hora_inicio).
    // The Service/Controller might expect that. Let's check.
    // Actually, looking at previous logs, the Service uses properties like `sch.hora_inicio`.
    _mapToDTO(doc) {
        return {
            id: doc._id,
            parallel_id: doc.parallelId,
            lab_id: doc.labId,
            dia: doc.dia,
            hora_inicio: doc.horaInicio,
            hora_fin: doc.horaFin,
            // Preserve these if they exist
            lab_name: doc.labName,
            subject_name: doc.subjectName,
            parallel_name: doc.parallelName
        };
    }
}

module.exports = SchedulesMongoDAO;
