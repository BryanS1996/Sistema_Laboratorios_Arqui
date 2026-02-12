const router = require('express').Router();
const reportsController = require('../controllers/reports.controller');
const { verifyToken, requireRole, requireAdmin } = require('../middleware/authJWT');
const upload = require('../middleware/upload.middleware');
const { cacheMiddleware } = require('../middleware/cache.middleware');

// Create report (Student/Professor/Admin) - with file upload
router.post('/',
    verifyToken,
    upload.single('image'),
    reportsController.create
);

// Get my reports (User specific)
router.get('/mine', verifyToken, reportsController.getMine);

// Get all reports (Admin only) - WITH CACHE
router.get('/',
    verifyToken,
    requireAdmin,
    cacheMiddleware('reports:all', 30),
    reportsController.getAll
);

module.exports = router;
