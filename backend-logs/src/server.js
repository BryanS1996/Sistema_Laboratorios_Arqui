const app = require('./app');

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // CRÍTICO: Bind a todas las interfaces para Docker

app.listen(PORT, HOST, () => {
    console.log(`🚀 Backend B (Logs API) running on http://${HOST}:${PORT}`);
    console.log(`📊 SSO mode enabled - accepts tokens from App A`);
    console.log(`🔐 JWT validation ready with shared secret`);
});
