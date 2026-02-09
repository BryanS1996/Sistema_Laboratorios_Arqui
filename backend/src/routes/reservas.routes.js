const router = require("express").Router();

const { verifyToken } = require("../middleware/authJWT");
const {
  crear,
  misReservas,
  obtener,
  actualizar,
  reporteMine,
  eliminar,
  listarDisponibilidad
} = require("../controllers/reservas.controller");

router.use(verifyToken);
<<<<<<< HEAD
=======
router.get("/", listarDisponibilidad); // Nueva ruta para disponibilidad pública
>>>>>>> test
router.post("/", crear);
router.get("/mine", misReservas);
router.get("/mine/report", reporteMine);
router.get("/:id", obtener);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;
