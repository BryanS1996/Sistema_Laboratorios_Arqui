# Gestor_Laboratorio (full stack)

Frontend: React + Tailwind (Vite)  
Backend: Express (DAO/DTO + Abstract Factory)  
DBs: PostgreSQL (users/login) + MongoDB (reservas)

## Requisitos
- Docker Desktop / Docker Engine


2. Levanta los contenedores:

```bash
docker compose up --build
```

3. Abre el frontend:
- `http://localhost:5173`

## Endpoints principales
- `POST /auth/register`
- `POST /auth/login`
- `GET /reservas/mine` (requiere Bearer token)
- `POST /reservas` (requiere Bearer token)
- `DELETE /reservas/:id` (requiere Bearer token)
