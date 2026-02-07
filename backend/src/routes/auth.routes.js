const router = require("express").Router();
const { verifyToken } = require("../middleware/authJWT");
const authController = require("../controllers/auth.controller");

// Email/password authentication
router.post("/register", authController.register);
router.post("/login", authController.login);

// Firebase SSO authentication
router.post("/firebase", authController.firebaseLogin);

// Token management
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// Current user
router.get("/me", verifyToken, authController.me);

module.exports = router;
