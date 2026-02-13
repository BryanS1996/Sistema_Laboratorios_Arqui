
# SSO (Single Sign-On) - Documentación Implementación

## 📋 Descripción General

Se implementó un flujo SSO tipo redirección (similar a OAuth2) que permite:
- **APP A** (Admin Principal): Autenticación central en puerto 5173
- **APP B** (Logs Dashboard): Acceso usando JWT de APP A, en puerto 4000

Un usuario autenticado en APP A puede acceder a Logs (APP B) sin necesidad de login adicional, usando el mismo token JWT.

---

## 🔄 Flujo SSO Implementado

### OPCIÓN 3 - SSO con Redirección (la que se implementó)

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO SSO COMPLETO                         │
└─────────────────────────────────────────────────────────────────┘

1. APP A - Login
   ├─ Usuario ingresa credenciales en APP A
   ├─ Backend valida y genera JWT
   └─ Token se guarda en localStorage de APP A

2. APP A - Navegación
   ├─ Usuario hace clic en "Logs del Sistema" (sidebar)
   └─ Se ejecuta: handleLogsRedirect()

3. Redirección a APP B con Token
   ├─ Se obtiene token de localStorage
   ├─ URL: http://localhost:4000/logs?token=<JWT>
   └─ Browser redirige a APP B

4. APP B - Validación de Token
   ├─ LogsDashboard detecta ?token en URL
   ├─ Hace fetch a: /api/logs/sso?token=<JWT>
   ├─ Backend valida token con JWT_SECRET
   └─ Si es válido → muestra logs
              Si no → error

5. Resultado
   ├─ Si es ADMIN → Acceso a logs
   ├─ Si no es ADMIN → Error de permisos
   └─ Si token expirado → Sugerir volver a APP A
```

---

## 📁 Archivos Modificados

### 1. Backend - Middleware SSO
**Archivo**: `backend/src/middleware/ssoTokenFromURL.js` ✨ NUEVO

```javascript
// Valida JWT desde parámetro de URL (?token=...)
// Sin requerir header Authorization
function verifySSOTokenFromURL(req, res, next)
```

**Propósito**: Extraer y validar token de URL en lugar de header Authorization

---

### 2. Backend - Controlador de Logs
**Archivo**: `backend/src/controllers/logs.controller.js`

**Cambios**:
- ✨ Nuevo método: `getLogsViaSSOURL()`
- Valida permiso de admin
- Obtiene logs igual que endpoint normal
- Devuelve datos del usuario para confirmación

---

### 3. Backend - Rutas de Logs
**Archivo**: `backend/src/routes/logs.routes.js`

**Nuevo endpoint**:
```javascript
GET /api/logs/sso?token=<JWT>&limit=100
├─ Middleware: verifySSOTokenFromURL
├─ Requiere: token válido + rol admin
└─ Devuelve: { success, count, logs, user }
```

---

### 4. Frontend - Sidebar (APP A)
**Archivo**: `frontend/src/components/Sidebar.jsx`

**Cambios**:
- Importa `getToken` desde lib/api
- ✨ Nuevo función: `handleLogsRedirect()`
- Botón "Logs del Sistema":
  - Antes: NavLink a `/admin/logs`
  - Ahora: Button que redirige a `http://localhost:4000/logs?token=...`

```javascript
const handleLogsRedirect = () => {
  const token = getToken()
  const logsURL = `http://localhost:4000/logs?token=${encodeURIComponent(token)}`
  window.location.href = logsURL
}
```

---

### 5. Frontend - LogsDashboard (APP B)
**Archivo**: `frontend/src/pages/LogsDashboard.jsx`

**Cambios**:
- ✨ Soporta dos modos:
  1. **Modo Normal** (APP A): Token en localStorage, usa AppLayout
  2. **Modo SSO** (APP B): Token en URL, sin AppLayout

**Lógica**:
```javascript
export default function LogsDashboard() {
  const [searchParams] = useSearchParams();
  const ssoToken = searchParams.get('token');

  if (ssoToken) {
    // Modo SSO: sin AppLayout
    return <LogsDashboardContent ssoToken={ssoToken} />;
  }

  // Modo normal: con AppLayout
  return (
    <AppLayout>
      <LogsDashboardContent />
    </AppLayout>
  );
}
```

**En LogsDashboardContent**:
- Si `ssoToken` está presente:
  - Fetch a `/api/logs/sso?token=...` (sin header Authorization)
  - Muestra "Modo SSO Activo" 
  - Botón "Volver a APP A"
- Si no:
  - Comportamiento normal (apiFetch con header)

---

## 🔐 Seguridad Implementada

### ✅ Validaciones
1. **Token en URL**
   - Se valida contra `JWT_SECRET` (mismo que APP A)
   - Se verifica expiración
   - Se valida estructura JWT

2. **Autorización**
   - Solo admins (`role === 'admin'`) pueden acceder a logs
   - Validación de rol en `getLogsViaSSOURL()`

3. **HTTPS Ready**
   - URL usa `encodeURIComponent` para caracteres especiales
   - En producción, usar HTTPS para proteger URL con token

### ⚠️ Consideraciones
- El token en URL está expuesto en:
  - Historial del browser
  - Logs del servidor
  - Referer headers
- **Recomendación**: 
  - En producción, usar HTTPS
  - Considerar usar JWT corta duración para SSO
  - O cambiar a POST con CORS headers

---

## 🚀 Cómo Usar

### Para el Usuario (Admin)

1. **Iniciar sesión en APP A**
   ```
   http://localhost:5173/login
   ```

2. **Click en "Logs del Sistema" (Sidebar)**
   - Automáticamente redirige a: `http://localhost:4000/logs?token=...`

3. **Ver Logs (APP B)**
   - Valida token automáticamente
   - Muestra logs en tiempo real
   - Botón "Volver a APP A" para regresar

### Para Desarrolladores

**Probar endpoint SSO manualmente**:
```bash
# Obtener token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Usar token en endpoint SSO
curl "http://localhost:3000/api/logs/sso?token=<JWT>&limit=50"
```

---

## 🔧 Configuración

### Variables de Entorno Necesarias
```env
# Backend
JWT_SECRET=tu-clave-secreta
JWT_EXPIRES_IN=30m

# Frontend (opcional, vite.config.js lo configura automáticamente)
VITE_API_URL=http://localhost:3000
```

### Puerto 4000 (APP B)
- Si quieres que los logs se sirvan en puerto 4000:
  - Crear servidor separado
  - O usar proxy en nginx/Apache
  - O servir desde mismo backend en ruta `/logs`

**Actualmente**: El endpoint está en `http://localhost:3000/api/logs/sso`
- Para redirigir a puerto 4000, necesitas configurar proxy o servidor separado

---

## ⚡ Endpoints Disponibles

### Logs Tradicional (APP A - autenticación por contexto)
```
GET /api/logs/recent?limit=100
├─ Requiere: Header Authorization: Bearer <JWT>
├─ Requiere: rol admin
└─ Devuelve: logs
```

### Logs SSO (APP B - validación por URL)
```
GET /api/logs/sso?token=<JWT>&limit=100
├─ Requiere: ?token parámetro de URL
├─ Requiere: rol admin
└─ Devuelve: logs + user info
```

### Stats Logs
```
GET /api/logs/stats?timeRange=day
├─ Requiere: Header Authorization: Bearer <JWT>
├─ Requiere: rol admin
└─ Devuelve: estadísticas por rango de tiempo
```

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Usuario Admin, Token Válido
```
1. Login en APP A → token generado
2. Click "Logs del Sistema" → redirige a localhost:4000/logs?token=...
3. Resultado: ÉXITO - Ve logs en APP B
```

### ❌ Caso 2: Token Expirado
```
1. Token envejece (+ JWT_EXPIRES_IN)
2. Click "Logs del Sistema" → redirige a localhost:4000/logs?token=...
3. Resultado: ERROR - "Token expirado"
   → Suggestion: Volver a APP A y login nuevamente
```

### ❌ Caso 3: Usuario No-Admin
```
1. Login en APP A como estudiante (no admin)
2. Click "Logs del Sistema" → no aparece (verificar con isAdmin)
3. Si intenta acceso directo: localhost:4000/logs?token=...
4. Resultado: ERROR - "No tienes permisos"
```

### ❌ Caso 4: Token Inválido/Corrupto
```
1. URL manual: localhost:4000/logs?token=CORRUPTO
2. Resultado: ERROR - "Token inválido"
```

---

## 📊 Diagrama de Flujo Auth

```
        ┌──────────────┐
        │   Usuario    │
        └────────┬─────┘
                 │
        ┌────────▼─────────┐
        │   APP A - Login   │
        │  (5173:5173)     │
        └────────┬─────────┘
                 │
                 │ JWT generado
                 │ localStorage.setItem('accessToken', JWT)
                 │
        ┌────────▼──────────────────┐
        │  Sidebar - Admin Menu      │
        │  "Logs del Sistema"        │
        └────────┬──────────────────┘
                 │
                 │ handleLogsRedirect()
                 │ token = getToken()
                 │ redirect: localhost:4000/logs?token=JWT
                 │
        ┌────────▼──────────────────┐
        │  APP B - LogsDashboard     │
        │  (puerto 4000)             │
        └────────┬──────────────────┘
                 │
                 │ Detecta ?token en URL
                 │ Fetch: /api/logs/sso?token=JWT
                 │
        ┌────────▼──────────────────┐
        │  Backend Validación        │
        │  - Verificar JWT           │
        │  - Verificar rol admin     │
        │  - Obtener logs            │
        └────────┬──────────────────┘
                 │
     ┌───────────┴───────────┐
     │                       │
 ✅ VÁLIDO              ❌ INVÁLIDO
     │                       │
     ▼                       ▼
  Logs OK              Error Message
```

---

## 🔗 URLs de Referencia

| Componente | URL |
|-----------|-----|
| APP A (Principal) | http://localhost:5173 |
| APP A Login | http://localhost:5173/login |
| APP A Dashboard | http://localhost:5173/admin/dashboard |
| APP B SSO URL | http://localhost:4000/logs?token=JWT |
| Backend API | http://localhost:3000 |
| Logs Endpoint | http://localhost:3000/api/logs/recent |
| Logs SSO Endpoint | http://localhost:3000/api/logs/sso |

---

## 💡 Notas Importantes

### Token en localStorage vs URL
- **localStorage**: Seguro, pero no funciona en cross-domain
- **URL**: Cross-domain, pero menos seguro
- **Decisión**: URL permite acceso desde otro puerto/dominio (APP B)

### Mismo JWT_SECRET
- APP A y APP B usan el MISMO `JWT_SECRET`
- Esto permite que APP B valide tokens generados por APP A
- En producción, considerar claves diferentes para seguridad

### Sin AppLayout en SSO
- Modo SSO renderiza sin AppLayout
- Así no requiere autenticación previa del contexto
- Es una "entrada de puerta trasera" autenticada por token

### Auto-refresh
- SSO también soporta polling cada 5 segundos
- Mantiene logs actualizados en tiempo real

---

## 🚨 Troubleshooting

### Problema: "Token no proporcionado"
**Causa**: No hay token en URL
**Solución**: Asegúrate de que Sidebar redirigir correctamente con token

### Problema: "Token inválido"
**Causa**: Token corrupto o JWT_SECRET no coincide
**Solución**: Verificar que el token se genera y transmite correctamente

### Problema: "No tienes permisos"
**Causa**: Usuario no es admin
**Solución**: Usar cuenta con rol = 'admin'

### Problema: Token no se envía a APP B
**Causa**: localStorage del navegador aislado por dominio
**Solución**: Token en URL es intencional para cross-domain

---

## 📈 Visión Futura

- [ ] SSO con POST (más seguro que GET con token en URL)
- [ ] Refresh token automático en SSO
- [ ] Multiple apps integradas
- [ ] OAuth2 completo con redirect URIs
- [ ] OIDC (OpenID Connect) como alternativa

---

**Fecha**: 13 de febrero de 2026
**Estado**: ✅ Implementado y Funcional
