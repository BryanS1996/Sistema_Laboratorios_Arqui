const academicService = require("../services/academic.service");

// --- Subjects ---
async function createSubject(req, res) {
    try {
        const subject = await academicService.createSubject(req.body);
        res.status(201).json(subject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getAllSubjects(req, res) {
    try {
        const subjects = await academicService.getAllSubjects();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function updateSubject(req, res) {
    try {
        const subject = await academicService.updateSubject(req.params.id, req.body);
        res.json(subject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function deleteSubject(req, res) {
    try {
        await academicService.deleteSubject(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function assignProfessor(req, res) {
    try {
        const { professorId, subjectId } = req.body;
        await academicService.assignProfessor(professorId, subjectId);
        res.json({ message: "Profesor asignado correctamente" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getProfessorSubjects(req, res) {
    try {
        // Si es admin puede pedir de cualquier profesor, si no, del logueado?
        // Por ahora asumimos que el endpoint recibe el ID del profesor
        // O usamos req.user.id
        const professorId = req.params.id || req.user.id;
        const subjects = await academicService.getProfessorSubjects(professorId);
        res.json(subjects);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// --- Parallels ---
async function createParallel(req, res) {
    try {
        const parallel = await academicService.createParallel(req.body);
        res.status(201).json(parallel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getParallelsBySubject(req, res) {
    try {
        const parallels = await academicService.getParallelsBySubject(req.params.subjectId);
        res.json(parallels);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function updateParallel(req, res) {
    try {
        const parallel = await academicService.updateParallel(req.params.id, req.body);
        res.json(parallel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function deleteParallel(req, res) {
    try {
        await academicService.deleteParallel(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function assignStudent(req, res) {
    try {
        const { studentId, parallelId } = req.body;
        await academicService.assignStudent(studentId, parallelId);
        res.json({ message: "Estudiante asignado correctamente" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getStudentParallels(req, res) {
    try {
        const studentId = req.params.id || req.user.id;
        const parallels = await academicService.getStudentParallels(studentId);
        res.json(parallels);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
    assignProfessor,
    getProfessorSubjects,
    createParallel,
    getParallelsBySubject,
    updateParallel,
    deleteParallel,
    assignStudent,
    getStudentParallels
};
