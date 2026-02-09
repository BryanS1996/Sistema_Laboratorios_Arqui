const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const laboratoriosRoutes = require("./routes/laboratorios.routes");
const reservasRoutes = require("./routes/reservas.routes");
const reportsRoutes = require("./routes/reports.routes");
const academicRoutes = require("./routes/academic.routes");
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");

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
app.use("/laboratorios", laboratoriosRoutes);
app.use("/reservas", reservasRoutes);
app.use("/reports", reportsRoutes);
app.use("/academic", academicRoutes);
app.use("/users", userRoutes);
app.use("/chat", chatRoutes);

module.exports = app;
