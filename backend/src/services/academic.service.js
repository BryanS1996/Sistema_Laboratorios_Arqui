const SubjectPostgresDAO = require("../daos/postgres/SubjectPostgresDAO");
const ParallelPostgresDAO = require("../daos/postgres/ParallelPostgresDAO");

class AcademicService {
    constructor() {
        this.subjectDAO = new SubjectPostgresDAO();
        this.parallelDAO = new ParallelPostgresDAO();
    }

    // --- Subjects ---
    async createSubject(data) {
        if (!data.name) throw new Error("Nombre de asignatura requerido");
        return this.subjectDAO.create(data);
    }

    async getAllSubjects() {
        return this.subjectDAO.findAll();
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
        // TODO: Validar si professorId existe en Firestore?
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
}

module.exports = new AcademicService();
