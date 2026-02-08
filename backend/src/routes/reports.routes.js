const router = require('express').Router();
const reportsController = require('../controllers/reports.controller');
const { verifyToken, requireRole, requireAdmin } = require('../middleware/authJWT');
const upload = require('../middleware/upload.middleware');

// Create report (Student/Professor/Admin) - with file upload
router.post('/',
    verifyToken,
    upload.single('image'),
    reportsController.create
);

// Get my reports (User specific)
router.get('/mine', verifyToken, reportsController.getMine);

// Get all reports (Admin only)
router.get('/',
    verifyToken,
    requireAdmin,
    reportsController.getAll
);

module.exports = router;
