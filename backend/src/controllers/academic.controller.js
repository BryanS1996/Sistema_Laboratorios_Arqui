const academicService = require("../services/academic.service");

class AcademicController {
    // --- Subjects ---
    async createSubject(req, res) {
        try {
            const subject = await academicService.createSubject(req.body);
            res.status(201).json(subject);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getSubjects(req, res) {
        try {
            // Filter by user role (req.user populated by auth middleware)
            const subjects = await academicService.getSubjectsByUser(req.user);
            res.json(subjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getParallelsBySubject(req, res) {
        try {
            const { subjectId } = req.params;
            const parallels = await academicService.getParallelsBySubject(subjectId);
            res.json(parallels);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async updateSubject(req, res) {
        try {
            const { id } = req.params;
            const subject = await academicService.updateSubject(id, req.body);
            res.json(subject);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteSubject(req, res) {
        try {
            const { id } = req.params;
            await academicService.deleteSubject(id);
            res.json({ message: "Asignatura eliminada" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async assignProfessor(req, res) {
        try {
            const { professorId, subjectId } = req.body;
            await academicService.assignProfessor(professorId, subjectId);
            res.json({ message: "Asignación exitosa" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getProfessorSubjects(req, res) {
        try {
            const { professorId } = req.params;
            const subjects = await academicService.getProfessorSubjects(professorId);
            res.json(subjects);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- Parallels ---
    async createParallel(req, res) {
        try {
            const parallel = await academicService.createParallel(req.body);
            res.status(201).json(parallel);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateParallel(req, res) {
        try {
            const { id } = req.params;
            const parallel = await academicService.updateParallel(id, req.body);
            res.json(parallel);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deleteParallel(req, res) {
        try {
            const { id } = req.params;
            await academicService.deleteParallel(id);
            res.json({ message: "Paralelo eliminado" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getParallels(req, res) {
        try {
            const { subjectId } = req.query;
            if (subjectId) {
                const parallels = await academicService.getParallelsBySubject(subjectId);
                return res.json(parallels);
            }
            const parallels = await academicService.getAllParallels();
            res.json(parallels);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async assignStudent(req, res) {
        try {
            const { studentId, parallelId } = req.body;
            await academicService.assignStudent(studentId, parallelId);
            res.json({ message: "Inscripción exitosa" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getStudentParallels(req, res) {
        try {
            const { studentId } = req.params;
            const parallels = await academicService.getStudentParallels(studentId);
            res.json(parallels);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- NEW: Laboratories ---
    async createLaboratory(req, res) {
        try {
            const lab = await academicService.createLaboratory(req.body);
            res.status(201).json(lab);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getLaboratories(req, res) {
        try {
            const labs = await academicService.getLaboratories();
            res.json(labs);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // --- NEW: Schedules ---
    async assignSchedule(req, res) {
        try {
            const schedule = await academicService.assignSchedule(req.body);
            res.status(201).json(schedule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getSchedules(req, res) {
        try {
            const { parallelId } = req.query;
            if (parallelId) {
                const schedules = await academicService.getSchedulesByParallel(parallelId);
                return res.json(schedules);
            }
            const schedules = await academicService.getAllSchedules();
            res.json(schedules);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AcademicController();
