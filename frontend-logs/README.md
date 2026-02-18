# Frontend B - Dashboard de Logs (App B)

Frontend para el Dashboard de Logs con soporte SSO desde App A y login directo con Google.

## Características

- 🔐 **SSO desde App A**: Detecta token en URL (`?token=JWT`) y valida automáticamente
- 🔑 **Login directo**: Google OAuth para acceso independiente
- 📊 **Dashboard de Logs**: Visualización de logs de auditoría en tiempo real
- ♻️ **Auto-refresh**: Polling automático cada 5 segundos (desactivable)
- 🚀 **Vite + React**: Build rápido y desarrollo moderno

## Flujo SSO

1. Usuario en App A (localhost:5173) → Click "Logs del Sistema"
2. Redirect a App B: `http://localhost:5174?token=<JWT>`
3. App B detecta token, valida con Backend B
4. Si válido + admin → muestra logs
5. Token se limpia de URL por seguridad

## Componentes Críticos

### `App.jsx`
- Detecta `?token` en URL
- Llama a `validateSSOToken()` si hay token
- Fallback a login con Google si no hay token

### `GoogleLoginButton.jsx`
- **FIX CRÍTICO**: Retry logic para Google SDK
- Soluciona problema de SDK no cargando inmediatamente
- Max 20 reintentos (10 segundos total)

### `LogsDashboard.jsx`
- Muestra logs en tabla con formato
- Auto-refresh cada 5 segundos (solo en modo no-SSO)
- Ordena por fecha descendente

### `api.js`
- `validateSSOToken()`: POST token a Backend B
- `googleLogin()`: Login directo con Google
- `getRecentLogs()`: Obtener logs con auth tradicional

## Variables de Entorno

```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=<tu-google-client-id>
```

## Desarrollo

```bash
npm install
npm run dev  # localhost:5174
```

## Docker

```bash
docker build -t frontend-logs .
docker run -p 5174:80 frontend-logs
```

## Fixes Aplicados

✅ **Google SDK Retry Logic**: Soluciona `window.google is undefined`  
✅ **SSO Token Detection**: Detecta y valida token en URL automáticamente  
✅ **Security**: Limpia token de URL después de validación  
✅ **Admin-only**: Solo permite acceso a usuarios con role='admin'
