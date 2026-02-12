const router = require("express").Router();
const { cacheMiddleware } = require("../middleware/cache.middleware");

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
router.get("/", listarDisponibilidad);
router.post("/", crear);
router.get("/mine", cacheMiddleware('reservas', 5, (req) => req.user.id), misReservas);
router.get("/mine/report", reporteMine);
router.get("/:id", obtener);
router.put("/:id", actualizar);
router.delete("/:id", eliminar);

module.exports = router;
