const router = require("express").Router();
const { verifyToken } = require("../middleware/authJWT");
const authController = require("../controllers/auth.controller");

// Email/password authentication
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// Firebase SSO authentication
router.post("/firebase", (req, res) => authController.firebaseLogin(req, res));

// Token management
router.post("/refresh", (req, res) => authController.refresh(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

// Current user
router.get("/me", verifyToken, (req, res) => authController.me(req, res));

module.exports = router;
