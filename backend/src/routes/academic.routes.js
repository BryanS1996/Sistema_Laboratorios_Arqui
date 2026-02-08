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
router.get("/subjects", [verifyToken], academicController.getAllSubjects);
router.get("/subjects/:subjectId/parallels", [verifyToken], academicController.getParallelsBySubject);

// User specific routes
router.get("/professors/me/subjects", [verifyToken], academicController.getProfessorSubjects);
router.get("/students/me/parallels", [verifyToken], academicController.getStudentParallels);

module.exports = router;
