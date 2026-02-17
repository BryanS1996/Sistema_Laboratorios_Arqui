# 📚 Patrones de Diseño - Sistema de Gestión de Laboratorios

Una guía completa sobre cómo funcionan los patrones DAO, DTO y Polling en este proyecto.

---

## 📑 Tabla de Contenidos

1. [Patrón DAO](#patrón-dao-data-access-object)
2. [Patrón DTO](#patrón-dto-data-transfer-object)
3. [Patrón Polling](#patrón-polling-encuesta)
4. [Arquitectura Integrada](#arquitectura-integrada)
5. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🏗️ Patrón DAO (Data Access Object)

### ¿Qué es DAO?

El patrón **DAO** es una capa de abstracción que **encapsula toda la lógica de acceso a bases de datos**. Su objetivo es:

- ✅ Separar la lógica de negocios del acceso a datos
- ✅ Cambiar de base de datos sin afectar el reste del código
- ✅ Reutilizar el mismo código para múltiples BD (MongoDB, PostgreSQL, etc.)
- ✅ Facilitar pruebas unitarias (testing)

### ¿Cómo funciona?

#### 1️⃣ Interfaz Base (Contrato)

Define qué métodos **debe implementar** cualquier DAO.

**Ubicación**: `backend/src/daos/interfaces/ReservaDAO.js`

```javascript
class ReservaDAO {
  // Métodos que TODO DAO de Reservas debe tener
  async create(_reservaDTO) { 
    throw new Error("Not implemented"); 
  }
  
  async findByUser(_userId) { 
    throw new Error("Not implemented"); 
  }
  
  async findById(_id, _userId) { 
    throw new Error("Not implemented"); 
  }
  
  async updateById(_id, _userId, _reservaDTO) { 
    throw new Error("Not implemented"); 
  }
  
  async deleteById(_id, _userId) { 
    throw new Error("Not implemented"); 
  }
}

module.exports = ReservaDAO;
```

#### 2️⃣ Implementación para MongoDB

Implementa la interfaz con el código específico para MongoDB.

**Ubicación**: `backend/src/daos/mongo/ReservaMongoDAO.js`

```javascript
const ReservaDAO = require("../interfaces/ReservaDAO");
const { connectMongo } = require("../../config/mongo");
const ReservaModel = require("../../models/ReservaModel");

class ReservaMongoDAO extends ReservaDAO {
  /**
   * Crea una nueva reserva en MongoDB
   * @param {ReservaDTO} reservaDTO - Objeto con datos de la reserva
   * @returns {Object} Documento creado
   */
  async create(reservaDTO) {
    await connectMongo(); // Conectar a Mongo
    const doc = await ReservaModel.create({
      userId: reservaDTO.userId,
      laboratorio: reservaDTO.laboratorio,
      fecha: reservaDTO.fecha,
      horaInicio: reservaDTO.horaInicio,
      horaFin: reservaDTO.horaFin,
      motivo: reservaDTO.motivo,
      subjectId: reservaDTO.subjectId,
      parallelId: reservaDTO.parallelId,
      actividad: reservaDTO.actividad || "clase normal"
    });
    return doc;
  }

  /**
   * Obtiene todas las reservas de un usuario
   */
  async findByUser(userId) {
    await connectMongo();
    return ReservaModel.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Obtiene una reserva específica (validando que pertenece al usuario)
   */
  async findById(id, userId) {
    await connectMongo();
    return ReservaModel.findOne({ _id: id, userId });
  }

  /**
   * Obtiene TODAS las reservas (solo admin)
   */
  async findAll() {
    await connectMongo();
    return ReservaModel.find({}).sort({ createdAt: -1 });
  }

  /**
   * Actualiza una reserva de forma parcial
   * Solo actualiza campos que vienen en el DTO
   */
  async updateById(id, userId, reservaDTO) {
    await connectMongo();
    const update = {};

    if (reservaDTO.laboratorio !== undefined) update.laboratorio = reservaDTO.laboratorio;
    if (reservaDTO.fecha !== undefined) update.fecha = reservaDTO.fecha;
    if (reservaDTO.horaInicio !== undefined) update.horaInicio = reservaDTO.horaInicio;
    if (reservaDTO.horaFin !== undefined) update.horaFin = reservaDTO.horaFin;
    if (reservaDTO.motivo !== undefined) update.motivo = reservaDTO.motivo;

    const query = { _id: id };
    if (userId) query.userId = userId; // No admin puede ver cualquiera

    const doc = await ReservaModel.findOneAndUpdate(
      query,
      { $set: update },
      { new: true }
    );
    return doc;
  }

  /**
   * Elimina una reserva
   */
  async deleteById(id, userId) {
    await connectMongo();
    const query = { _id: id };
    if (userId) query.userId = userId;
    const r = await ReservaModel.deleteOne(query);
    return r.deletedCount === 1;
  }
}

module.exports = ReservaMongoDAO;
```

#### 3️⃣ Implementación para PostgreSQL

El mismo contrato, pero implementado para PostgreSQL.

**Ubicación**: `backend/src/daos/postgres/UserPostgresDAO.js`

```javascript
const UserDAO = require("../interfaces/UserDAO");
const { getPool } = require("../../config/postgres");

class UserPostgresDAO extends UserDAO {

  /**
   * Crea un nuevo usuario en PostgreSQL
   */
  async create(userData) {
    const { email, passwordHash, nombre, role, firebaseUid } = userData;
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO users(email, password_hash, nombre, role, firebase_uid)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, email, nombre, role, created_at, firebase_uid`,
      [email, passwordHash, nombre, role || 'student', firebaseUid || null]
    );
    return rows[0];
  }

  /**
   * Busca usuario por email
   */
  async findByEmail(email) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", 
              created_at, last_login, firebase_uid 
       FROM users WHERE email=$1 LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Busca usuario por ID de Firebase
   */
  async findByFirebaseUid(uid) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", 
              created_at, last_login, firebase_uid 
       FROM users WHERE firebase_uid=$1 LIMIT 1`,
      [uid]
    );
    return rows[0] || null;
  }

  /**
   * Busca usuario por ID
   */
  async findById(id) {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, email, nombre, role, password_hash as "passwordHash", 
              created_at, last_login 
       FROM users WHERE id=$1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Actualiza solo el último login
   */
  async updateLastLogin(id) {
    const pool = getPool();
    await pool.query(
      "UPDATE users SET last_login=NOW() WHERE id=$1",
      [id]
    );
  }
}

module.exports = UserPostgresDAO;
```

### ¿Dónde está el DAO en el sistema?

```
backend/src/daos/
├── interfaces/              ← Contratos (qué métodos debe tener)
│   ├── ReservaDAO.js       ← Interfaz para Reservas
│   └── UserDAO.js          ← Interfaz para Usuarios
├── mongo/                   ← Implementación para MongoDB
│   └── ReservaMongoDAO.js   ← Cómo guardar Reservas en Mongo
└── postgres/                ← Implementación para PostgreSQL
    ├── UserPostgresDAO.js   ← Cómo guardar Usuarios en Postgres
    ├── SubjectPostgresDAO.js
    ├── LaboratoryPostgresDAO.js
    └── ...
```

### Ventajas en la práctica

✅ **Cambiar de BD es fácil** - Si necesitas cambiar MongoDB a PostgreSQL para Reservas, solo cambias `ReservaMongoDAO` a `ReservaPostgresDAO`

✅ **Testing** - Puedes crear un `ReservaDAOMock` para pruebas sin necesidad de BD real

✅ **Múltiples BDs** - Usa MongoDB para Reservas y PostgreSQL para Usuarios sin problemas

✅ **Código limpio** - El Controller no sabe ni le importa dónde se guardan los datos

---

## 📦 Patrón DTO (Data Transfer Object)

### ¿Qué es DTO?

El patrón **DTO** es un objeto que **transporta datos entre capas** de la aplicación sin incluir lógica de negocio.

**Propósito:**
- ✅ Definir **cuáles datos** se transfieren
- ✅ **Validar estructura** de datos
- ✅ **Separar** la estructura interna (BD) de la externa (API)
- ✅ Proteger datos sensibles (nunca enviar contraseñas, tokens, etc.)

### Estructura de DTOs

#### 1️⃣ ReservaDTO

**Ubicación**: `backend/src/dtos/ReservaDTO.js`

```javascript
class ReservaDTO {
  constructor({ id, userId, laboratorio, fecha, horaInicio, horaFin, motivo, subjectId, parallelId, actividad }) {
    this.id = id;                      // ID único
    this.userId = userId;              // A quién pertenece
    this.laboratorio = laboratorio;    // Cuál laboratorio
    this.fecha = fecha;                // En formato YYYY-MM-DD
    this.horaInicio = horaInicio;      // En formato HH:mm (ej: 09:00)
    this.horaFin = horaFin;            // En formato HH:mm (ej: 11:00)
    this.motivo = motivo;              // Por qué (ej: "Examen", "Práctica")
    this.subjectId = subjectId;        // Materia (opcional)
    this.parallelId = parallelId;      // Paralelo (opcional)
    this.actividad = actividad;        // Tipo de actividad
  }
}

module.exports = ReservaDTO;
```

#### 2️⃣ UserDTO

**Ubicación**: `backend/src/dtos/UserDTO.js`

```javascript
class UserDTO {
  constructor({ id, email, nombre, role, academicLoad }) {
    this.id = id;                      // ID del usuario
    this.email = email;                // Email
    this.nombre = nombre;              // Nombre completo
    this.role = role;                  // Rol (student, teacher, admin)
    this.academicLoad = academicLoad || null;  // Carga académica (opcional)
    
    // ⚠️ NOTA: NO incluimos password, tokens, datos sensibles
  }
}

module.exports = UserDTO;
```

#### 3️⃣ ReservaUsuarioDTO

**Ubicación**: `backend/src/dtos/ReservaUsuarioDTO.js`

```javascript
// DTO enriquecido: Reserva + datos del Usuario
class ReservaUsuarioDTO {
  constructor(reserva, usuario) {
    this.reservaId = reserva.id;
    this.usuario = usuario;            // Objeto UserDTO completo
    this.laboratorio = reserva.laboratorio;
    this.fecha = reserva.fecha;
    this.horaInicio = reserva.horaInicio;
    this.horaFin = reserva.horaFin;
    this.motivo = reserva.motivo;
  }
}

module.exports = ReservaUsuarioDTO;
```

### Flujo de datos en la API

```
┌─────────────────────────────────────────┐
│  Cliente (Frontend)                     │
│  GET /api/reservas/me                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│  Controller ← Recibe la petición         │
│  parseRequest() → Valida                 │
└──────────────────┬───────────────────────┘
                   │
                   ▼ ReservaDTO
┌──────────────────────────────────────────┐
│  Service ← Procesa lógica de negocio     │
│  calculateConflicts(reservaDTO)          │
└──────────────────┬───────────────────────┘
                   │
                   ▼ ReservaDTO
┌──────────────────────────────────────────┐
│  DAO ← Accede a la base de datos        │
│  findByUser(userId)                      │
└──────────────────┬───────────────────────┘
                   │
                   ▼ Document (MongoDB)
        ┌──────────────────────┐
        │  MongoDB             │
        │  {                   │
        │    _id: ObjectId,   │
        │    userId: "1",     │
        │    laboratorio: "...",
        │    fecha: Date,     │
        │    ...              │
        │  }                  │
        └──────────────────────┘
                   │
                   ▼ ReservaDTO (transporta limpiamente)
┌──────────────────────────────────────────┐
│  JSON Response al Cliente                │
│  {                                       │
│    "id": "507f1f77bcf86cd799439011",   │
│    "userId": "1",                       │
│    "laboratorio": "Lab 1",              │
│    "fecha": "2026-02-11",               │
│    "horaInicio": "09:00",               │
│    "horaFin": "11:00"                   │
│  }                                      │
└──────────────────────────────────────────┘
```

### ¿Cuándo usar DTO?

| Situación | Usar DTO | Razón |
|-----------|----------|-------|
| Transferir datos entre Controller y Service | ✅ | Validation/Seguridad |
| Pasar datos al DAO | ✅ | Abstracción |
| Serializar respuesta HTTP | ✅ | No exponer estructura interna |
| Datos internos dentro de un servicio | ❌ | Overhead innecesario |
| Transferencia de datos sensibles | ✅ | Excluir contraseñas, tokens |

---

## 🔄 Patrón Polling (Encuesta)

### ¿Qué es Polling?

**Polling** es una técnica donde el **cliente pregunta regularmente al servidor** si hay datos nuevos, en lugar de esperar a que el servidor notifique.

```
POLLING (Cliente pregunta cada X segundos):
┌─────────────────────────────────────────────┐
│ Frontend                                    │
│ ¿Hay nuevas reservas? (3 segundos)          │
└──────────────┬──────────────────────────────┘
               │ GET /api/reservas
               ▼
┌──────────────────────────────────────────────┐
│ Backend                                      │
│ Sí, aquí están: [...]                        │
└──────────────┬───────────────────────────────┘
               │
               ▼ (Frontend espera 3 segundos)
               
               ¿Hay nuevas reservas? (3 segundos)
               
               ... (repite infinitamente)
```

### Implementación en tu sistema

#### 1️⃣ PollingService (Backend del Frontend)

**Ubicación**: `frontend/src/lib/polling.js`

```javascript
/**
 * Servicio de Polling Adaptativo
 * 
 * Características:
 * - Detecta si la pestaña está activa/inactiva
 * - Ajusta frecuencia automáticamente
 * - Reutilizable para múltiples polls simultáneos
 */
class PollingService {
    constructor() {
        this.intervals = new Map(); // Almacena todos los polls activos
        this.pollInterval = 3000;   // Intervalo por defecto (3 segundos)
        this.isActive = !document.hidden; // ¿Está la pestaña activa?

        // Escucha cambios de visibilidad (cambiar de pestaña)
        document.addEventListener('visibilitychange', () => {
            const wasActive = this.isActive;
            this.isActive = !document.hidden;

            if (wasActive !== this.isActive) {
                this.updateAllIntervals(); // Reajusta frecuencias
            }
        });
    }

    /**
     * Obtiene el intervalo actual según estado de la pestaña
     * @returns {number} Intervalo en milisegundos
     */
    getCurrentInterval() {
        return this.isActive ? 3000 : 10000;
        // 3 segundos si activa, 10 segundos si oculta
    }

    /**
     * Inicia polling para una clave específica
     * @param {string} key - Identificador único (ej: 'reservas', 'usuarios')
     * @param {Function} callback - Función a ejecutar cada intervalo
     * @param {number|null} customInterval - Intervalo personalizado (opcional)
     */
    start(key, callback, customInterval = null) {
        // Detener valor anterior si existe
        this.stop(key);

        const interval = customInterval || this.getCurrentInterval();

        // Ejecutar inmediatamente (no esperar el primer intervalo)
        callback();

        // Configurar intervalo repetido
        const intervalId = setInterval(callback, interval);
        
        // Guardar para poder detener después
        this.intervals.set(key, {
            id: intervalId,
            callback,
            customInterval
        });

        console.log(`📊 Polling iniciado: ${key} (cada ${interval / 1000}s)`);
    }

    /**
     * Detiene polling para una clave específica
     */
    stop(key) {
        const interval = this.intervals.get(key);
        if (interval) {
            clearInterval(interval.id);
            this.intervals.delete(key);
            console.log(`⏹️ Polling detenido: ${key}`);
        }
    }

    /**
     * Detiene todos los polls activos
     */
    stopAll() {
        this.intervals.forEach((interval, key) => {
            clearInterval(interval.id);
            console.log(`⏹️ Polling detenido: ${key}`);
        });
        this.intervals.clear();
    }

    /**
     * Reajusta todos los intervalos cuando cambia la visibilidad
     */
    updateAllIntervals() {
        const newInterval = this.getCurrentInterval();
        console.log(`🔄 Pestaña ${this.isActive ? 'activa' : 'oculta'}, ajustando a ${newInterval / 1000}s`);

        this.intervals.forEach((interval, key) => {
            // Ignorar polls con intervalo personalizado
            if (interval.customInterval) {
                return;
            }

            // Reiniciar con nuevo intervalo
            clearInterval(interval.id);
            const newId = setInterval(interval.callback, newInterval);
            this.intervals.set(key, {
                ...interval,
                id: newId
            });
        });
    }

    /**
     * Verifica si hay polling activo para una clave
     */
    isPolling(key) {
        return this.intervals.has(key);
    }

    /**
     * Obtiene todas las claves de polling activo
     */
    getActivePolls() {
        return Array.from(this.intervals.keys());
    }
}

// Exportar instancia singleton (única)
export const pollingService = new PollingService();
export default pollingService;
```

#### 2️⃣ Hook de React: usePolling

**Ubicación**: `frontend/src/hooks/usePolling.js`

```javascript
import { useEffect, useRef } from 'react';
import { pollingService } from '../lib/polling';

/**
 * Custom Hook para usar polling en componentes React
 * 
 * @param {string} key - Clave única para este polling (ej: 'mis-reservas')
 * @param {Function} callback - Función a ejecutar en cada poll
 * @param {boolean} enabled - ¿Está habilitado? (default: true)
 * @param {number|null} customInterval - Intervalo personalizado en ms (default: null)
 * 
 * @example
 * ```
 * usePolling('reservas', async () => {
 *   const data = await fetch('/api/reservas/me').then(r => r.json());
 *   setReservas(data);
 * }, true, 5000);
 * ```
 */
export function usePolling(key, callback, enabled = true, customInterval = null) {
    // Usar ref para siempre tener la última versión del callback
    const callbackRef = useRef(callback);

    // Actualizar ref cuando cambio el callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Principal: controlar polling
    useEffect(() => {
        if (!enabled) {
            // Si no está habilitado, detener
            pollingService.stop(key);
            return;
        }

        // Iniciar polling con el callback
        pollingService.start(key, () => callbackRef.current(), customInterval);

        // Limpieza: detener al desmontar o cambiar parámetros
        return () => {
            pollingService.stop(key);
        };
    }, [key, enabled, customInterval]);
}

export default usePolling;
```

### Ejemplo de uso en un componente React

```javascript
import { useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { fetchMisReservas } from '../services/reservasService';

export function MisReservas() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Iniciar polling cada 5 segundos
    usePolling(
        'mis-reservas',
        async () => {
            setLoading(true);
            try {
                const data = await fetchMisReservas();
                setReservas(data);
            } catch (error) {
                console.error('Error al obtener reservas:', error);
            } finally {
                setLoading(false);
            }
        },
        true,  // Habilitado
        5000   // Cada 5 segundos
    );

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <h2>Mis Reservas</h2>
            {reservas.map(res => (
                <div key={res.id}>
                    <p>{res.laboratorio} - {res.fecha} ({res.horaInicio}-{res.horaFin})</p>
                </div>
            ))}
        </div>
    );
}
```

### Características Inteligentes del Polling

#### 🎯 Adaptativo a Visibilidad

```javascript
// Si está en la pestaña activa → Poll cada 3 segundos
// Si está en background → Poll cada 10 segundos (ahorra batería/CPU)

// El servicio detecta automáticamente cuando cambias de pestaña
window.addEventListener('visibilitychange', () => ...)
```

#### ⏱️ Múltiples Polls Simultáneos

```javascript
// En diferentes componentes, cada uno con su clave:

// Componente 1: Actualizar reservas cada 3 segundos
usePolling('reservas', fetchReservas);

// Componente 2: Actualizar usuarios cada 5 segundos
usePolling('usuarios', fetchUsuarios);

// Componente 3: Actualizar laboratorios cada 10 segundos
usePolling('laboratorios', fetchLaboratorios);

// Todos funcionan en paralelo sin interferir
```

#### 🔑 Sistema de Claves

```javascript
// Parar polling específico
pollingService.stop('reservas');

// Ver qué polls están activos
pollingService.getActivePolls(); // ['reservas', 'usuarios', 'laboratorios']

// Parar todos
pollingService.stopAll();
```

### Ventajas del Polling

✅ **Simple de implementar** - Basado en `setInterval`  
✅ **Compatible con cualquier servidor** - No necesita WebSocket  
✅ **Controla automáticamente** - Detecta pestaña activa/inactiva  
✅ **Múltiples fuentes** - Puede hacer polling de varios datos  
⚠️ **Latencia** - Datos se actualizan cada N segundos, no en tiempo real  
⚠️ **Carga servidor** - Muchos clientes haciendo polling = muchas requests  

### Alternativas a Polling

| Tecnología | Ventajas | Desventajas |
|------------|----------|------------|
| **Polling** (actual) | Simple, universal | Latencia, carga servidor |
| **WebSocket** | Tiempo real, eficiente | Más complejo |
| **Server-Sent Events** | Unidireccional en tiempo real | No todos los navegadores |
| **GraphQL Subscriptions** | Tipo-seguro, moderno | Complejidad extra |

---

## 🏛️ Arquitectura Integrada

### Diagrama Completo del Sistema

```
╔═════════════════════════════════════════════════════════════════╗
║                     FRONTEND (React)                            ║
║                                                                 ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  Componente: MisReservas                  │                 ║
║  │  - useState([reservas, setReservas])      │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  usePolling Hook                          │                 ║
║  │  - key: 'mis-reservas'                    │                 ║
║  │  - callback: fetchMisReservas()           │                 ║
║  │  - interval: 5000ms (5 segundos)          │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  PollingService (Singleton)               │                 ║
║  │  - Detecta visibilidad de pestaña         │                 ║
║  │  - Gestiona múltiples intervals            │                 ║
║  │  - Ajusta frecuencia automáticamente       │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  │ GET /api/reservas/me (cada 5s)              ║
║                  │ Authorization: Bearer TOKEN                  ║
║                  ▼                                              ║
╠═════════════════════════════════════════════════════════════════╣
║                   BACKEND (Node.js)                             ║
║                                                                 ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  Router                                   │                 ║
║  │  GET /api/reservas/me                    │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  Middleware                               │                 ║
║  │  - authJWT (verificar token)              │                 ║
║  │  - rateLimitControl (evitar abuso)        │                 ║
║  │  - cacheMiddleware (cache Redis)          │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  Controller (laboratorios.controller.js)  │                 ║
║  │  - async getMisReservas(req, res)         │                 ║
║  │  - Extrae userId del token                │                 ║
║  │  - Llama al Service                       │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  │ new ReservaDTO({...})                        ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  Service (laboratorios.service.js)        │                 ║
║  │  - async getReservasByUser(reservaDTO)    │                 ║
║  │  - Lógica de negocio                      │                 ║
║  │  - Validaciones                           │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  │ reservaDTO                                   ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  Factory                                  │                 ║
║  │  - HybridFactory.createReservaDAO()       │                 ║
║  │  - Retorna ReservaMongoDAO                │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  ▼                                              ║
║  ┌───────────────────────────────────────────┐                 ║
║  │  DAO (ReservaMongoDAO)                    │                 ║
║  │  - async findByUser(userId)               │                 ║
║  │  - Conecta a MongoDB                      │                 ║
║  │  - Ejecuta query                          │                 ║
║  └───────────────┬─────────────────────────┘                   ║
║                  │                                              ║
║                  │ MongoDB Documents                            ║
║                  ▼                                              ║
╠═════════════════════════════════════════════════════════════════╣
║                   DATABASES                                     ║
║                                                                 ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         ║
║  │  MongoDB     │  │  PostgreSQL  │  │  Redis       │         ║
║  │  (Reservas)  │  │  (Usuarios)  │  │  (Cache)     │         ║
║  │              │  │              │  │              │         ║
║  │ db.reservas  │  │ table users  │  │ key-value    │         ║
║  │ {            │  │ {            │  │ {            │         ║
║  │   _id: ...,  │  │   id: ...,   │  │   "user:1":  │         ║
║  │   userId,    │  │   email,     │  │   {...},     │         ║
║  │   fecha,     │  │   password,  │  │              │         ║
║  │   ...        │  │   role,      │  │   "labs":    │         ║
║  │ }            │  │   ...        │  │   [{...}]    │         ║
║  │              │  │ }            │  │              │         ║
║  └──────────────┘  └──────────────┘  └──────────────┘         ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝
```

### Flujo de datos (ejemplo: obtener mis reservas)

```
1️⃣ INICIO (Frontend)
   usePolling('mis-reservas', fetchReservas, true, 5000)
   ↓
2️⃣ SOLICITUD HTTP
   GET /api/reservas/me
   Header: Authorization: Bearer eyJhbGc...
   ↓
3️⃣ MIDDLEWARE (Backend)
   ✓ authJWT - Valida token → extrae userId
   ✓ rateLimitControl - ¿Usuario ha hecho muchas peticiones?
   ✓ cacheMiddleware - ¿Datos en Redis?
   ↓
4️⃣ CONTROLLER (laboratorios.controller.js)
   const userId = req.user.id;
   const result = await reservasService.getReservasByUser(userId);
   res.json(result);
   ↓
5️⃣ SERVICE (laboratorios.service.js)
   const reservaDTO = new ReservaDTO({ userId });
   return await reservasDAO.findByUser(reservaDTO);
   ↓
6️⃣ DAO (ReservaMongoDAO)
   await connectMongo();
   return ReservaModel.find({ userId }).sort({ createdAt: -1 });
   ↓
7️⃣ BASE DE DATOS (MongoDB)
   db.reservas.find({ userId: "1" })
   Retorna: [...documents]
   ↓
8️⃣ RESPUESTA (Backend → Frontend)
   JSON:
   [
     {
       id: "507f1f77bcf86cd799439011",
       userId: "1",
       laboratorio: "Lab 1",
       fecha: "2026-02-11",
       horaInicio: "09:00",
       horaFin: "11:00"
     },
     ...
   ]
   ↓
9️⃣ ACTUALIZACIÓN (Frontend)
   setReservas(data);
   Componente re-renderiza con nuevas reservas
   ↓
🔟 ESPERA
   Polling espera 5 segundos → vuelve al paso 2️⃣
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Crear una nueva Reserva

```javascript
// FRONTEND (React)
async function crearReserva() {
    const nuevoReserva = {
        laboratorio: "Lab 1",
        fecha: "2026-02-12",
        horaInicio: "09:00",
        horaFin: "11:00",
        motivo: "Práctica de Programación"
    };

    const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token'
        },
        body: JSON.stringify(nuevoReserva)
    });
    
    const creada = await response.json();
    console.log('Reserva creada:', creada);
    
    // El polling automáticamente lo verá en la siguiente actualización
}

// BACKEND (Node.js) - Controller
async function create(req, res) {
    try {
        const userId = req.user.id;
        const { laboratorio, fecha, horaInicio, horaFin, motivo } = req.body;

        // Crear DTO con datos validados
        const reservaDTO = new ReservaDTO({
            userId,
            laboratorio,
            fecha,
            horaInicio,
            horaFin,
            motivo
        });

        // Llamar al servicio
        const reserva = await reservasService.crear(reservaDTO);

        // Retornar como JSON
        res.status(201).json(reserva);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// BACKEND - Service
async function crear(reservaDTO) {
    // Validación
    if (!reservaDTO.laboratorio || !reservaDTO.fecha) {
        throw new Error("Laboratorio y fecha son requeridos");
    }

    // Verificar que no hay conflictos
    const conflictos = await reservasDAO.findOverlapping(
        reservaDTO.laboratorio,
        reservaDTO.fecha,
        reservaDTO.horaInicio,
        reservaDTO.horaFin
    );

    if (conflictos.length > 0) {
        throw new Error("Hay un conflicto de horario");
    }

    // Crear en la BD
    return await reservasDAO.create(reservaDTO);
}

// BACKEND - DAO (MongoDB)
async create(reservaDTO) {
    await connectMongo();
    const doc = await ReservaModel.create({
        userId: reservaDTO.userId,
        laboratorio: reservaDTO.laboratorio,
        fecha: new Date(reservaDTO.fecha),
        horaInicio: reservaDTO.horaInicio,
        horaFin: reservaDTO.horaFin,
        motivo: reservaDTO.motivo,
        createdAt: new Date()
    });
    return doc;
}
```

### Ejemplo 2: Cambiar entre Bases de Datos

Si quisieras cambiar de MongoDB a PostgreSQL para Reservas:

```javascript
// Opción 1: Cambiar el DAO en el Controller
// De:
const reservasDAO = new ReservaMongoDAO();

// A:
const reservasDAO = new ReservaPostgresDAO();

// El rest del código NO cambia


// Opción 2: Usar Factory (más profesional)
// backend/src/factories/HybridFactory.js
class HybridFactory extends PersistenceFactory {
  createReservaDAO() {
    // Elegir según env var
    if (process.env.RESERVAS_DB === 'postgres') {
        return new ReservaPostgresDAO();
    }
    return new ReservaMongoDAO();
  }

  createUserDAO() {
    return new UserPostgresDAO();
  }
}
```

### Ejemplo 3: Detener Polling cuando desmontes componente

```javascript
import { useState } from 'react';
import { usePolling } from '../hooks/usePolling';

export function Dashboard() {
    const [reservas, setReservas] = useState([]);
    const [pollEnabled, setPollEnabled] = useState(true);

    usePolling(
        'dashboard-reservas',
        async () => {
            const data = await fetch('/api/reservas').then(r => r.json());
            setReservas(data);
        },
        pollEnabled  // Lo activamos/desactivamos según estado
    );

    return (
        <div>
            <button onClick={() => setPollEnabled(!pollEnabled)}>
                {pollEnabled ? 'Parar' : 'Iniciar'} actualización
            </button>
            
            <div>
                {reservas.map(res => (
                    <div key={res.id}>{res.laboratorio}</div>
                ))}
            </div>
        </div>
    );
    
    // Cuando desmontar el componente, usePolling limpia automáticamente
    // el polling mediante cleanup en useEffect
}
```

---

## 📚 Resumen Quick Reference

| Patrón | Propósito | Ubicación | Ejemplo |
|--------|-----------|-----------|---------|
| **DAO** | Abstrae acceso a BD | `daos/` | `ReservaMongoDAO.create()` |
| **DTO** | Transporta datos entre capas | `dtos/` | `new ReservaDTO({...})` |
| **Polling** | Cliente pregunta por actualizaciones | `frontend/lib/polling.js` | `usePolling('key', callback)` |
| **Factory** | Crea instancias de DAOs | `factories/` | `HybridFactory.createReservaDAO()` |

---

## 🔗 Recursos Adicionales

- MongoDB: https://docs.mongodb.com/
- PostgreSQL: https://www.postgresql.org/docs/
- React Hooks: https://react.dev/reference/react
- Design Patterns: https://refactoring.guru/design-patterns

---

**Última actualización**: 11 de febrero de 2026  
**Autor**: Sistema de Gestión de Laboratorios
