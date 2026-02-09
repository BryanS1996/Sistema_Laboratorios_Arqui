const SubjectPostgresDAO = require("../daos/postgres/SubjectPostgresDAO");
const ParallelPostgresDAO = require("../daos/postgres/ParallelPostgresDAO");
const LaboratoryPostgresDAO = require("../daos/postgres/LaboratoryPostgresDAO");
const SchedulesMongoDAO = require("../daos/mongo/SchedulesMongoDAO"); // Switched to Mongo
const UserPostgresDAO = require("../daos/postgres/UserPostgresDAO");
const SemesterPostgresDAO = require("../daos/postgres/SemesterPostgresDAO");

class AcademicService {
    constructor() {
        this.subjectDAO = new SubjectPostgresDAO();
        this.parallelDAO = new ParallelPostgresDAO();
        this.labDAO = new LaboratoryPostgresDAO();
        this.scheduleDAO = new SchedulesMongoDAO(); // Switched to Mongo
        this.userDAO = new UserPostgresDAO();
        this.semesterDAO = new SemesterPostgresDAO();
    }
    // ... (rest of the file until assignSchedule)

    // --- Schedules ---
    async assignSchedule(data) {
        const { labId, dia, horaInicio, horaFin, parallelId } = data;

        if (!labId || !dia || !horaInicio || !horaFin || !parallelId) {
            throw new Error("Todos los campos de horario son requeridos (Laboratorio, Día, Inicio, Fin, Paralelo)");
        }

        if (horaInicio >= horaFin) {
            throw new Error("Rango de horas inválido: la hora de fin debe ser posterior a la de inicio");
        }

        // Validation: Overlap
        try {
            const conflicts = await this.scheduleDAO.findConflicts(labId, dia, horaInicio, horaFin);
            if (conflicts.length > 0) {
                throw new Error(`Conflicto de horario: El laboratorio ya está ocupado el ${dia} de ${horaInicio} a ${horaFin}`);
            }

            // Enrich data for MongoDB denormalization
            const lab = await this.labDAO.findById(labId);
            const parallel = await this.parallelDAO.findById(parallelId); // Should include subject info or we fetch it

            // Note: parallelDAO.findById might just return the parallel. We might need subject name.
            // Let's assume we need to fetch subject too if parallel doesn't have it.
            // Postgres ParallelDAO.findById usually returns plain row. 
            // Let's check ParallelPostgresDAO.findById quickly? 
            // Better yet, let's fetch extended info or just fetch subject separately.

            let subjectName = "Desconocida";
            let parallelName = "A";

            if (parallel) {
                parallelName = parallel.name;
                const subject = await this.subjectDAO.findById(parallel.subject_id);
                if (subject) subjectName = subject.name;
            }

            const scheduleData = {
                ...data,
                labName: lab ? lab.nombre : 'Laboratorio',
                subjectName,
                parallelName
            };

            return await this.scheduleDAO.create(scheduleData);
        } catch (err) {
            console.error("Error in assignSchedule:", err.message);
            throw err;
        }
    }

    // --- Semesters ---
    async getAllSemesters() {
        return this.semesterDAO.findAll();
    }

    // --- Subjects ---
    async createSubject(data) {
        if (!data.name) throw new Error("Nombre de asignatura requerido");
        return this.subjectDAO.create(data);
    }

    async getAllSubjects() {
        return this.subjectDAO.findAll();
    }

    /**
     * Get subjects based on user role:
     * - Admin: All subjects
     * - Professor: Assigned subjects
     * - Student: Enrolled subjects
     */
    async getSubjectsByUser(user) {
        if (user.role === 'admin') {
            return this.subjectDAO.findAll();
        } else if (user.role === 'professor') {
            return this.subjectDAO.getSubjectsByProfessor(user.id);
        } else if (user.role === 'student') {
            return this.subjectDAO.getSubjectsByStudent(user.id);
        }
        return [];
    }

    async getSubjectById(id) {
        return this.subjectDAO.findById(id);
    }

    async deleteSubject(id) {
        return this.subjectDAO.delete(id);
    }

    async updateSubject(id, data) {
        return this.subjectDAO.update(id, data);
    }

    async assignProfessor(professorId, subjectId) {
        // Validar existencia?
        const subject = await this.subjectDAO.findById(subjectId);
        if (!subject) throw new Error("Asignatura no encontrada");
        return this.subjectDAO.assignProfessor(professorId, subjectId);
    }

    async getProfessorSubjects(professorId) {
        return this.subjectDAO.getSubjectsByProfessor(professorId);
    }

    // --- Parallels ---
    async createParallel(data) {
        if (!data.name || !data.subjectId) throw new Error("Nombre y ID de asignatura requeridos");
        return this.parallelDAO.create(data);
    }

    async getAllParallels() {
        return this.parallelDAO.findAll();
    }

    async getParallelsBySubject(subjectId) {
        return this.parallelDAO.findBySubject(subjectId);
    }

    async updateParallel(id, data) {
        return this.parallelDAO.update(id, data);
    }

    async deleteParallel(id) {
        return this.parallelDAO.delete(id);
    }

    async assignStudent(studentId, parallelId) {
        const parallel = await this.parallelDAO.findById(parallelId);
        if (!parallel) throw new Error("Paralelo no encontrado");
        return this.parallelDAO.assignStudent(studentId, parallelId);
    }

    async getStudentParallels(studentId) {
        return this.parallelDAO.getParallelsByStudent(studentId);
    }

    async getParallelNamesBySemester(semesterId) {
        return this.parallelDAO.findNamesBySemester(semesterId);
    }

    // --- Laboratories ---
    async createLaboratory(data) {
        if (!data.nombre || !data.capacidad) throw new Error("Nombre y capacidad requeridos");
        return this.labDAO.create(data);
    }

    async getLaboratories() {
        return this.labDAO.findAll();
    }

    async updateLaboratory(id, data) {
        return this.labDAO.update(id, data);
    }

    async deleteLaboratory(id) {
        return this.labDAO.delete(id);
    }

    // --- Schedules ---
    async assignSchedule(data) {
        const { labId, dia, horaInicio, horaFin, parallelId } = data;

        if (!labId || !dia || !horaInicio || !horaFin || !parallelId) {
            throw new Error("Todos los campos de horario son requeridos (Laboratorio, Día, Inicio, Fin, Paralelo)");
        }

        if (horaInicio >= horaFin) {
            throw new Error("Rango de horas inválido: la hora de fin debe ser posterior a la de inicio");
        }

        // Validation: Overlap
        try {
            const conflicts = await this.scheduleDAO.findConflicts(labId, dia, horaInicio, horaFin);
            if (conflicts.length > 0) {
                throw new Error(`Conflicto de horario: El laboratorio ya está ocupado el ${dia} de ${horaInicio} a ${horaFin}`);
            }
            return await this.scheduleDAO.create(data);
        } catch (err) {
            console.error("Error in assignSchedule:", err.message);
            throw err;
        }
    }

    async getSchedulesByParallel(parallelId) {
        return this.scheduleDAO.findByParallel(parallelId);
    }

    async getSchedulesByLab(labId) {
        return this.scheduleDAO.findByLab(labId);
    }

    async getAllSchedules() {
        return this.scheduleDAO.findAll();
    }

    // --- User Academic Load ---
    async getUserAcademicLoad(userId) {
        const user = await this.userDAO.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");
        return this.userDAO.getAcademicLoad(user);
    }

    async updateStudentSemester(studentId, semester, parallelName) {
        // Here we arguably should auto-enroll student in default parallels or just tag them
        // For now, let's assume we just update a user metadata field or handle it in DAO
        return this.userDAO.updateStudentSemester(studentId, semester, parallelName);
    }

    async updateProfessorSubjects(professorId, subjectIds) {
        return this.subjectDAO.updateProfessorAssignments(professorId, subjectIds);
    }

    // --- Generation ---
    async generateReservations(startDate, endDate, scheduleId = null, requestingUser = null) {
        const reservasService = require("./reservas.service");
        let schedules = [];

        if (scheduleId) {
            const all = await this.scheduleDAO.findAll();
            // Use loose equality for safety with potential string/int IDs
            schedules = all.filter(s => s.id == scheduleId);
        } else {
            schedules = await this.scheduleDAO.findAll();
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Helper Map
        const dayMap = {
            0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado"
        };

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dayName = dayMap[d.getDay()];
            const dailySchedules = schedules.filter(s => s.dia === dayName);

            for (const sch of dailySchedules) {
                try {
                    if (!requestingUser) continue;

                    // Prepare Data
                    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

                    // As requested: Admin is recorded as the user who made the reservation
                    const conflictCheckUser = { id: requestingUser.id, role: requestingUser.role };

                    await reservasService.crear(conflictCheckUser, {
                        laboratorio: sch.lab_name,
                        fecha: dateStr,
                        horaInicio: sch.hora_inicio,
                        horaFin: sch.hora_fin,
                        motivo: `Clase: ${sch.subject_name} (${sch.parallel_name})`,
                        subjectId: sch.subject_id,
                        parallelId: sch.parallel_id,
                        actividad: 'clase normal'
                    });
                } catch (err) {
                    // Ignore conflicts if they are already scheduled
                    console.error(`Conflict generating reservation: ${err.message}`);
                }
            }
        }
        return { message: "Proceso de generación completado" };
    }
}

module.exports = new AcademicService();
