const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/authJWT');
const { cacheMiddleware } = require('../middleware/cache.middleware');

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

// Ruta principal con caché (polling cada 2s en frontend)
router.get('/all',
  cacheMiddleware('dashboard:all', 10, (req) => req.query.timeRange || 'month'),
  dashboardController.getAllStats
);

module.exports = router;
