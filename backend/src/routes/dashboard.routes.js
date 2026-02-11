const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/authJWT');

// Todas las rutas requieren autenticación y rol admin
router.use(verifyToken);

// Middleware para verificar rol admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
};

router.use(isAdmin);

// Rutas
router.get('/stats', dashboardController.getStats);
router.get('/top-users', dashboardController.getTopUsers);
router.get('/common-hours', dashboardController.getCommonHours);
router.get('/all', dashboardController.getAllStats);

module.exports = router;
