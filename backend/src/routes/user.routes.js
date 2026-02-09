const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/authJWT');

router.get('/', verifyToken, userController.getUsers);
router.put('/:id/role', verifyToken, userController.updateUserRole);

module.exports = router;
