const express = require('express');
const router = express.Router();
const controller = require('../controllers/laboratorios.controller');
const { verifyToken } = require('../middleware/authJWT');

// Public or Protected? User needs to see labs to book. Protected is better.
router.get('/', verifyToken, controller.listar);
router.get('/:id', verifyToken, controller.obtener);
router.get('/:id/disponibilidad', verifyToken, controller.disponibilidad);

module.exports = router;
