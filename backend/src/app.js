const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const reservasRoutes = require("./routes/reservas.routes");

// Aplicación Express (sin levantar el servidor). Permite testear/usar en server.js
const app = express();

// CORS para el frontend (Vite por defecto corre en :5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Endpoint simple para verificar que el backend está vivo.
app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/reservas", reservasRoutes);

module.exports = app;
