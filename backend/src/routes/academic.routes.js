const express = require("express");
const router = express.Router();
const academicController = require("../controllers/academic.controller");
const { verifyToken, requireRole, requireAdmin } = require("../middleware/authJWT");

// Admin routes for managing subjects and parallels
router.post("/subjects", [verifyToken, requireAdmin], academicController.createSubject);
router.put("/subjects/:id", [verifyToken, requireAdmin], academicController.updateSubject);
router.delete("/subjects/:id", [verifyToken, requireAdmin], academicController.deleteSubject);

router.post("/parallels", [verifyToken, requireAdmin], academicController.createParallel);
router.put("/parallels/:id", [verifyToken, requireAdmin], academicController.updateParallel);
router.delete("/parallels/:id", [verifyToken, requireAdmin], academicController.deleteParallel);

router.post("/assignments/professor", [verifyToken, requireAdmin], academicController.assignProfessor);
router.post("/assignments/student", [verifyToken, requireAdmin], academicController.assignStudent);

// Public/Shared routes
router.get("/subjects/catalog", academicController.getAllSubjects); // Public catalog
router.get("/subjects", [verifyToken], academicController.getSubjects);
router.get("/subjects/:subjectId/parallels", [verifyToken], academicController.getParallelsBySubject);

// User specific routes
router.get("/professors/me/subjects", [verifyToken], academicController.getProfessorSubjects);
// Admin route to get subjects of a specific professor
router.get("/professors/:professorId/subjects", [verifyToken, requireAdmin], academicController.getProfessorSubjects);
router.get("/students/me/parallels", [verifyToken], academicController.getStudentParallels);

// --- Laboratories ---
router.post("/laboratories", [verifyToken, requireAdmin], academicController.createLaboratory);
router.get("/laboratories", [verifyToken], academicController.getLaboratories);

// --- Schedules ---
router.post("/schedules", [verifyToken, requireAdmin], academicController.assignSchedule);
router.get("/schedules", [verifyToken], academicController.getSchedules);

// --- Context Updates ---
router.put("/students/:id/semester", [verifyToken, requireAdmin], academicController.updateStudentSemester);
router.put("/professors/:id/subjects", [verifyToken, requireAdmin], academicController.updateProfessorSubjects);
router.get("/semesters/:semesterId/parallels", academicController.getParallelNamesBySemester);
router.get("/semesters", academicController.getSemesters);
router.post("/generate-reservations", [verifyToken, requireAdmin], academicController.generateReservations);

// Labs
router.put("/laboratories/:id", [verifyToken, requireAdmin], academicController.updateLaboratory);
router.delete("/laboratories/:id", [verifyToken, requireAdmin], academicController.deleteLaboratory);

module.exports = router;
