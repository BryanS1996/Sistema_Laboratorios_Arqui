const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const reservasRoutes = require("./routes/reservas.routes");
const academicRoutes = require("./routes/academic.routes");

// Aplicación Express (sin levantar el servidor). Permite testear/usar en server.js
const app = express();

// CORS para el frontend (Vite por defecto corre en :5173)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser()); // Parse cookies for refresh tokens

// Endpoint simple para verificar que el backend está vivo.
app.get("/health", (_, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/reservas", reservasRoutes);
app.use("/academic", academicRoutes);

module.exports = app;
