require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routes
const authRoutes = require('./routes/auth.routes');
const logsRoutes = require('./routes/logs.routes');

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS - permitir orígenes locales y remotos
const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5174', // Origen remoto
    'http://localhost:5174', // Localhost
    'http://127.0.0.1:5174',  // Loopback
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'), false);
        }
    },
    credentials: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/api/logs', logsRoutes);

// Healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'backend-logs', sso: 'enabled' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

module.exports = app;
