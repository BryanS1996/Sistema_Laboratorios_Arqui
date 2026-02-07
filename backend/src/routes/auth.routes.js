const router = require("express").Router();
const authJWT = require("../middleware/authJWT");
const { register, login, me } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authJWT, me);

module.exports = router;
