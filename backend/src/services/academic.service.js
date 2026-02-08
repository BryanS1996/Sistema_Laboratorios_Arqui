const SubjectPostgresDAO = require("../daos/postgres/SubjectPostgresDAO");
const ParallelPostgresDAO = require("../daos/postgres/ParallelPostgresDAO");
const LaboratoryPostgresDAO = require("../daos/postgres/LaboratoryPostgresDAO");
const SchedulesPostgresDAO = require("../daos/postgres/SchedulesPostgresDAO");
const UserPostgresDAO = require("../daos/postgres/UserPostgresDAO");

class AcademicService {
    constructor() {
        this.subjectDAO = new SubjectPostgresDAO();
        this.parallelDAO = new ParallelPostgresDAO();
        this.labDAO = new LaboratoryPostgresDAO();
        this.scheduleDAO = new SchedulesPostgresDAO();
        this.userDAO = new UserPostgresDAO(); // For academic load
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

    // --- Laboratories ---
    async createLaboratory(data) {
        if (!data.nombre || !data.capacidad) throw new Error("Nombre y capacidad requeridos");
        return this.labDAO.create(data);
    }

    async getLaboratories() {
        return this.labDAO.findAll();
    }

    // --- Schedules ---
    async assignSchedule(data) {
        const { labId, dia, horaInicio, horaFin } = data;

        // Validation: Overlap
        const conflicts = await this.scheduleDAO.findConflicts(labId, dia, horaInicio, horaFin);
        if (conflicts.length > 0) {
            throw new Error(`Conflicto de horario: El laboratorio ya está ocupado el ${dia} de ${horaInicio} a ${horaFin}`);
        }

        return this.scheduleDAO.create(data);
    }

    async getSchedulesByParallel(parallelId) {
        return this.scheduleDAO.findByParallel(parallelId);
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
}

module.exports = new AcademicService();
