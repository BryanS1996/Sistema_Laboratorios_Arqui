const router = require("express").Router();

const authJWT = require("../middleware/authJWT");
const {
  crear,
  misReservas,
  obtener,
  actualizar,
  reporteMine,
  eliminar,
} = require("../controllers/reservas.controller");

router.use(authJWT);
router.post("/", crear);
router.get("/mine", misReservas);
router.get("/mine/report", reporteMine);
router.get("/:id", obtener);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;
