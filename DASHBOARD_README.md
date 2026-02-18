# Dashboard de Reservas - Guía de Implementación

## ✅ Cambios Realizados

### Backend

Se han agregado los siguientes archivos y cambios:

#### 1. Nuevo Servicio: `backend/src/services/dashboard.service.js`
- Extrae estadísticas de reservas desde MongoDB
- Agrupa datos por: día, laboratorio, hora
- Calcula top 5 usuarios con más reservas
- Obtiene horarios más frecuentes
- Incluye filtros por rango de tiempo (día, semana, mes)

**Métodos principales:**
- `getReservationStats(timeRange)` - Estadísticas de reservas
- `getTopUsers()` - Top 5 usuarios
- `getMostCommonHours()` - Horarios más frecuentes
- `getAllStats(timeRange)` - Todo junto

#### 2. Nuevo Controlador: `backend/src/controllers/dashboard.controller.js`
- Expone endpoints HTTP para las estadísticas
- Incluye logging detallado para debugging

#### 3. Nuevas Rutas: `backend/src/routes/dashboard.routes.js`
```
GET /dashboard/stats?timeRange=month|week|day    - Estadísticas generales
GET /dashboard/top-users                         - Top 5 usuarios
GET /dashboard/common-hours                      - Horarios frecuentes
GET /dashboard/all?timeRange=month|week|day      - Todo combinado
```

Todas las rutas requieren:
- Token JWT válido (`Authorization: Bearer <token>`)
- Rol de administrador

#### 4. Actualizado: `backend/src/app.js`
- Registrada nueva ruta: `app.use("/dashboard", dashboardRoutes);`

### Frontend

#### 1. Nuevo Componente: `frontend/src/pages/AdminDashboard.jsx`
- Interfaz visual con gráficos usando Recharts
- **Gráface de líneas:** Reservas por día (tendencia)
- **Gráfica circular:** Reservas por laboratorio (distribución)
- **Lista ordenada:** Top 5 usuarios con estadísticas
- **Gráfica de barras:** Horarios más frecuentes (top 10)
- **Gráfica de barras:** Distribución horaria del día
- Selector de rango de tiempo: Hoy / Esta semana / Este mes
- Tarjeta destacada con total de reservas
- Manejo de estados: loading, error, datos vacíos

#### 2. Actualizado: `frontend/src/App.jsx`
- Importado AdminDashboard
- Nueva ruta: `/admin/dashboard` (solo admin)

#### 3. Actualizado: `frontend/src/components/Sidebar.jsx`
- Agregado ícono BarChart3 de lucide-react
- Nuevo enlace en menú admin: "Dashboard"

## 🚀 Cómo Ejecutar

### 1. Inicia el Backend

```bash
cd backend
npm install          # Si no está hecho
npm start            # Inicia en puerto 3000
```

Deberías ver en logs:
```
✅ Firebase Admin inicializado exitosamente
[Dashboard] Getting stats for timeRange: month
```

### 2. Inicia el Frontend

```bash
cd frontend
npm install          # Si no está hecho
npm run dev         # Inicia en puerto 5173
```

### 3. Accede al Dashboard

1. Abre `http://localhost:5173`
2. Login con credenciales de admin
3. En el Sidebar → **Administración** → **Dashboard**
   - O directo: `http://localhost:5173/admin/dashboard`

## 📊 Gráficos Disponibles

### 1. Total de Reservas
Tarjeta flotante en azul con el total del período seleccionado.

### 2. Reservas por Día
Gráfica de líneas que muestra la tendencia de reservas en el tiempo.

### 3. Reservas por Laboratorio
Gráfica circular (pie chart) que muestra la distribución porcentual entre laboratorios.

### 4. Top 5 Usuarios
Lista ordenada con:
- Posición (1-5)
- Nombre del usuario
- Email
- Total de reservas realizadas

### 5. Horarios Frecuentes
Gráfica de barras con los 10 horarios más populares (rango hora inicio - hora fin).

### 6. Distribución Horaria del Día
Gráfica de barras que muestra a qué horas del día se hacen más reservas.

## 🔍 Debugging

Si ves errores en el navegador:

1. **Error 500 en `/dashboard/all`**:
   - Revisa logs del backend
   - Verifica que MongoDB esté corriendo
   - Asegúrate de que hay datos de reservas en la base de datos

2. **Datos vacíos en gráficos**:
   - Crea algunas reservas de prueba
   - El dashboard solo muestra datos del período seleccionado

3. **No aparece el Dashboard en Sidebar**:
   - Verifica que estés logged como admin
   - Recarga la página (Ctrl+R)

## 📝 Variables de Entorno Requeridas

**Backend** (`backend/.env`):
```
MONGO_URI=mongodb://...
```

## 🔐 Seguridad

- ✅ Solo admins pueden acceder
- ✅ Requiere JWT válido
- ✅ Manejo de errores sin exponer secretos
- ✅ Logging detallado para auditoría

## 📦 Dependencias

No se requieren nuevas dependencias. Todo usa:
- `recharts` - Ya instalado en frontend
- Mongoose - Ya en backend
- Express - Ya en backend

## 🎨 Personalización

Para cambiar colores:
1. Edita `COLORS` array en AdminDashboard.jsx
2. Modifica clases Tailwind en componentes

Para agregar nuevas métricas:
1. Agrega método en `dashboard.service.js`
2. Expón en `dashboard.controller.js`
3. Llama desde el componente

## ✨ Próximas Mejoras (Opcional)

- [ ] Exportar datos a PDF/CSV
- [ ] Agregar más filtros (por usuario, laboratorio)
- [ ] Gráfico de motivos de reserva
- [ ] Análisis de cancelaciones
- [ ] Comparativa período anterior
- [ ] Alertas de picos de demanda
