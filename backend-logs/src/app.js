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

// CORS - permitir solo App B
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5174',
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
