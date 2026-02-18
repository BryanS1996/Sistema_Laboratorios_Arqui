# Backend B - API de Logs (App B)

Backend para el Dashboard de Logs con soporte SSO desde App A.

## Características

- 🔐 **SSO desde App A**: Acepta tokens JWT generados por Backend A
- 🔑 **Login directo**: Google OAuth para acceso independiente
- 📊 **Acceso a Logs**: Lectura desde Redis (cache) y PostgreSQL A (readonly)
- 🗄️ **PostgreSQL B**: Base de datos propia para usuarios de App B
- 🚀 **Docker ready**: Con bind a 0.0.0.0 para acceso desde contenedores

## Endpoints

### Autenticación
- `POST /auth/google` - Login con Google OAuth (directo en App B)
- `GET /auth/me` - Obtener usuario actual

### Logs (Admin only)
- `POST /api/logs/sso` - Obtener logs via SSO (token en body)
- `GET /api/logs/recent` - Obtener logs (auth tradicional con header)

## Variables de Entorno

Ver `.env` para configuración. **CRÍTICO**: `JWT_SECRET` debe ser el mismo que Backend A.

## Arquitectura

- **Triple conexión**: PostgreSQL B (users), PostgreSQL A readonly (audit_logs), Redis (cache)
- **SSO**: Valida tokens JWT generados por App A usando shared secret
- **Admin-only**: Solo usuarios con role='admin' pueden acceder

## Desarrollo

```bash
npm install
npm run dev  # con nodemon
```

## Docker

```bash
docker build -t backend-logs .
docker run -p 3001:3001 --env-file .env backend-logs
```
