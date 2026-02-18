# 🐳 Guía de Uso de Docker

## 📋 Requisitos Previos

1. **Docker y Docker Compose instalados**
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Archivo `.env` configurado en `backend/`**
   - Copia desde `.env.example`
   - Configura tus credenciales

---

## 🚀 Comandos Principales

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ borra datos)
```bash
docker-compose down -v
```

### Reconstruir imágenes
```bash
# Reconstruir todo
docker-compose build

# Reconstruir y reiniciar
docker-compose up -d --build
```

---

## 🗄️ Gestión de Bases de Datos

### Inicializar Firestore
```bash
# Ejecutar script dentro del contenedor
docker-compose exec backend npm run init-firestore
```

### Acceder a PostgreSQL
```bash
docker-compose exec postgres psql -U lab -d labdb
```

### Acceder a MongoDB
```bash
docker-compose exec mongo mongosh gestor_lab
```

---

## 🔍 Debug y Troubleshooting

### Ver estado de servicios
```bash
docker-compose ps
```

### Entrar a un contenedor (shell interactivo)
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Postgres
docker-compose exec postgres sh

# MongoDB
docker-compose exec mongo sh
```

### Ver variables de entorno
```bash
docker-compose exec backend env
```

### Reiniciar un servicio específico
```bash
docker-compose restart backend
docker-compose restart frontend
```

---

## 📦 Servicios y Puertos

| Servicio | Puerto Host | Puerto Contenedor |
|----------|-------------|-------------------|
| Frontend | 5173 | 5173 |
| Backend API | 3000 | 3000 |
| PostgreSQL | 5432 | 5432 |
| MongoDB | 27017 | 27017 |

---

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: `postgresql://lab:lab@localhost:5432/labdb`
- **MongoDB**: `mongodb://localhost:27017/gestor_lab`

---

## 🔄 Hot Reload

Los volúmenes están configurados para **hot reload automático**:
- Cambios en `backend/src` → Backend se recarga automáticamente
- Cambios en `frontend/src` → Frontend se recarga automáticamente

---

## 🛠️ Comandos Útiles

### Limpiar todo Docker
```bash
# Detener todos los contenedores
docker-compose down

# Limpiar imágenes, contenedores, redes, volúmenes
docker system prune -a --volumes
```

### Ver uso de recursos
```bash
docker stats
```

### Exportar base de datos
```bash
# PostgreSQL
docker-compose exec postgres pg_dump -U lab labdb > backup.sql

# MongoDB
docker-compose exec mongo mongodump --db=gestor_lab --out=/data/backup
docker cp gestor_lab_mongo:/data/backup ./mongo_backup
```

---

## 📝 Notas Importantes

1. **Primera ejecución**: Las bases de datos tardan unos segundos en inicializarse
2. **Healthchecks**: El backend esperará a que Postgres y Mongo estén listos
3. **Credenciales**: `serviceAccountKey.json` debe existir antes de `docker-compose up`
4. **Red Docker**: Todos los servicios están en la red `gestor_lab_network`
5. **Volúmenes**: Los datos persisten entre reinicios (hasta que hagas `down -v`)

---

## 🐛 Problemas Comunes

### Error: "Cannot find module"
```bash
# Reconstruir con cache limpio
docker-compose build --no-cache backend
docker-compose up -d
```

### Error: "ECONNREFUSED mongo:27017"
```bash
# Esperar a que Mongo esté listo
docker-compose logs mongo

# Verificar healthcheck
docker-compose ps
```

### Puerto ya en uso
```bash
# Ver qué está usando el puerto
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Linux/Mac

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Usar 3001 en vez de 3000
```

---

## ✅ Flujo de Trabajo Recomendado

```bash
# 1. Configurar entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# 2. Iniciar servicios
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Inicializar Firestore (primera vez)
docker-compose exec backend npm run init-firestore

# 5. Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# 6. Desarrollar (los cambios se reflejan automáticamente)

# 7. Detener cuando termines
docker-compose down
```
