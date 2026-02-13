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
const dashboardRoutes = require("./routes/dashboard.routes");
const logsRoutes = require("./routes/logs.routes");

// Aplicación Express (sin levantar el servidor). Permite testear/usar en server.js
const app = express();

// CORS para ambas instancias del frontend (APP A: 5173, APP B: 5174)
app.use(
    cors({
        origin: function(origin, callback) {
            // Permitir localhost con cualquier puerto para desarrollo
            if (!origin || origin.startsWith('http://localhost:')) {
                callback(null, true);
            } else if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        },
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
app.use("/dashboard", dashboardRoutes);
app.use("/api/logs", logsRoutes);

module.exports = app;
