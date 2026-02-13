<div align="center">
  <img src="frontend/public/uce-logo.png" alt="Universidad Central del Ecuador" width="200" />
  <h1>Sistema de Gestión de Laboratorios</h1>
  <h3>Facultad de Ingeniería</h3>
</div>

<div align="center">

  ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
  
  <br/>

  ![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
  ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
  ![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

</div>

<br/>

Este proyecto es un sistema integral para la gestión, reserva y administración de laboratorios de computación de la Facultad. Implementa una arquitectura moderna, híbrida y resiliente, diseñada para soportar alta concurrencia y gestión académica compleja.

## 🚀 Características Principales

*   **Gestión de Reservas Inteligente**: Sistema de reservas validado con reglas de negocio complejas (prioridad profesor/estudiante, regla de los 10 minutos, conflictos de horario).
*   **Roles de Usuario**:
    *   **Estudiante**: Reservas de práctica libre.
    *   **Profesor**: Prioridad en reservas y asignación a materias.
    *   **Administrador**: Control total del sistema.
*   **Gestión Académica**: Control de Semestres, Materias, Paralelos y Carga Horaria.
*   **Dashboard de Logs en Tiempo Real**: Monitorización de actividad administrativa usando **Redis Pub/Sub** y WebSockets/Polling.
*   **Resiliencia**: Sistema capaz de operar en modo degradado (lectura de caché Redis) si la base de datos principal (Postgres) falla.
*   **Autenticación Robusta**: **Google OAuth** con gestión de sesiones segura mediante JWT en Cookies HttpOnly.

## 🛠️ Stack Tecnológico

*   **Frontend**: React + Vite + TailwindCSS (ShadcnUI, Lucide Icons).
*   **Backend**: Node.js + Express.
*   **Bases de Datos**:
    *   **PostgreSQL**: Datos relacionales (Usuarios, Roles, Académico, Auditoría Permanente).
    *   **MongoDB**: Datos operativos volátiles (Reservas, Historial de Chat).
    *   **Redis**: Capa de Caché, Colas de Logs Recientes y Pub/Sub para tiempo real.
*   **Autenticación**: Google OAuth 2.0 + JWT (Access Token + Refresh Token).
*   **Infraestructura**: Docker Compose (Contenedores para App, DBs y herramientas de gestión).

---

## 🏗️ Arquitectura del Sistema

El sistema utiliza un diseño basado en patrones **DAO (Data Access Object)** y persistencia políglota, optimizada con una capa de caché de alto rendimiento.

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'background': '#FFFFFF', 'mainBkg': '#FFFFFF'}}}%%
graph TD
    User["Usuario / Admin"] -->|HTTPS| Frontend["Vite Frontend App"]
    
    subgraph "Frontend Layer"
        Frontend --> AuthCtx["Auth Context (Google OAuth)"]
        Frontend --> Query["TanStack Query"]
        Frontend --> Polling["Real-time Dashboard"]
    end
    
    subgraph "Backend API Gateway"
        Polling -->|REST Request| API["Express Server"]
        Query -->|REST Request| API
        
        API --> AuthMw["Auth Middleware (JWT Verify)"]
        API --> CacheMw["Cache Middleware"]
        
        AuthMw --> Controllers["Controllers Layer"]
        CacheMw --> Controllers
    end
    
    subgraph "Persistence Layer"
        Controllers --> Factory["DAO Factory"]
        
        Factory -->|Relational Data| Postgres[("PostgreSQL")]
        Factory -->|Operational Data| MongoDB[("MongoDB")]
        
        Controllers <-->|"Cache HIT/MISS"| Redis[("Redis RAM")]
        
        Postgres -.->|"Replica/Sync"| Redis
    end
```

---

## 💾 Bases de Datos

El sistema utiliza un enfoque híbrido para aprovechar las fortalezas de SQL y NoSQL.

### 1. PostgreSQL (Core & Académico)
Maneja la integridad referencial fuerte requerida para la estructura académica y usuarios.

#### Diagrama E-R (Entidad-Relación)

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'background': '#FFFFFF', 'mainBkg': '#FFFFFF'}}}%%
erDiagram
    USERS ||--o{ PROFESSOR_ASSIGNMENTS : "tiene"
    USERS ||--o{ STUDENT_ENROLLMENTS : "tiene"
    USERS {
        int id PK
        string email
        string password_hash
        string role "admin, professor, student"
        string google_id
    }

    SEMESTERS ||--|{ SUBJECTS : "contiene"
    SEMESTERS {
        int id PK
        string name
        boolean active
    }

    SUBJECTS ||--|{ PARALLELS : "tiene"
    SUBJECTS ||--o{ PROFESSOR_ASSIGNMENTS : "asignada a"
    SUBJECTS {
        int id PK
        string name
        int semester_id FK
    }

    PARALLELS ||--o{ STUDENT_ENROLLMENTS : "inscritos"
    PARALLELS ||--o{ SCHEDULES : "tiene horario"
    PARALLELS {
        int id PK
        string name "A, B, C"
        int subject_id FK
    }

    LABORATORIES ||--o{ SCHEDULES : "ocupado por"
    LABORATORIES {
        int id PK
        string nombre
        int capacidad
        string ubicacion
    }

    SCHEDULES {
        int id PK
        string dia
        time hora_inicio
        time hora_fin
        int parallel_id FK
        int lab_id FK
    }
```

### 2. MongoDB (Reservas)
Maneja las transacciones de reservas, permitiendo flexibilidad y rapidez en consultas de rangos de fechas.

**Colección: `reservas`**

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `_id` | ObjectId | Identificador único |
| `userId` | String | ID del usuario (Postgres ID) |
| `nombre` | String | Nombre del usuario (Caché visual) |
| `laboratorio` | String | Nombre del laboratorio |
| `fecha` | String | Formato YYYY-MM-DD |
| `horaInicio` | String | Formato HH:mm |
| `horaFin` | String | Formato HH:mm |

### 3. Redis (Caché de Rendimiento)
Utilizado para acelerar el Dashboard Administrativo y las consultas frecuentes de disponibilidad mediante:
- **Middleware de Caché**: Intercepción de rutas GET.
- **Polling Optimization**: Soporta actualizaciones cada 2s con mínimo impacto en DB.
- **TTLs Dinámicos**: Entre 5 y 30 segundos según la volatilidad del dato.

---

## 🔐 Flujo de Autenticación (Google OAuth)

El sistema ha eliminado Firebase en favor de una autenticación nativa con Google OAuth para mayor control y privacidad.

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'background': '#FFFFFF', 'mainBkg': '#FFFFFF'}}}%%
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant G as Google Auth
    participant B as Backend
    participant D as PostgreSQL

    U->>F: Clic "Iniciar con Google"
    F->>G: Solicita Acceso (Scope: profile, email)
    G-->>F: Retorna ID Token
    
    F->>B: POST /auth/google { token }
    B->>G: Verifica validez del Token
    G-->>B: Token Válido + Datos Usuario
    
    B->>D: Buscar o Crear Usuario (Upsert)
    D-->>B: User ID & Rol
    
    B->>B: Generar JWT (Access & Refresh)
    B-->>F: Set-Cookie (HttpOnly JWT)
    
    F->>B: GET /auth/me (con Cookie)
    B-->>F: Retorna Datos de Usuario + Rol
```

---

## 💾 Modelo de Datos Híbrido

### 1. PostgreSQL (Estructura y Seguridad)
*   **Tablas**: `users`, `audit_logs`, `semesters`, `subjects`, `parallels`, `schedules`.
*   **Función**: Garantiza la integridad referencial de la carga académica y la seguridad de los usuarios.

### 2. MongoDB (Flexibilidad Operativa)
*   **Colecciones**: `reservas`, `laboratorios`, `chat_messages`.
*   **Función**: Permite consultas complejas de rangos de fechas para reservas y almacenamiento de mensajes de chat.

### 3. Redis (Velocidad y Tiempo Real)
*   **Estructuras**:
    *   `recent_audit_logs` (List): Últimos 100 eventos para el dashboard.
    *   `reservas:date` (Key-Value): Caché de disponibilidad.
*   **Función**: Provee respuestas en <10ms para dashboards y reduce carga en bases de datos.

---

## 💻 Instalación y Despliegue

### Requisitos Previos
*   Docker & Docker Compose

### Pasos para Ejecutar

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/BryanS1996/Sistema_Laboratorios_Arqui.git
    cd Sistema_Laboratorios_Arqui
    ```

2.  **Configurar Entorno**
    *   Asegúrate de tener los archivos `.env` en `backend/` y `frontend/` (ver `.env.example`).
    *   **Importante**: Necesitas credenciales de Google OAuth (Client ID).

3.  **Iniciar con Docker Compose**
    ```bash
    docker-compose up --build -d
    ```
    
    Servicios disponibles:
    *   **Frontend**: http://localhost:5173
    *   **Backend**: http://localhost:3000
    *   **Mongo Express**: http://localhost:8081
    *   **Redis Commander**: http://localhost:8082
    *   **pgAdmin**: http://localhost:5050

### 🧪 Ejecución de Tests (Resiliencia)

Este proyecto incluye una suite de pruebas de estrés con **k6** para verificar la robustez del sistema y el funcionamiento del caché Redis.

Para ejecutar los tests de estrés y ver el dashboard de métricas:

```powershell
# Ejecutar test de logs y resiliencia
k6 run stress_test_logs_fullstack.js
```

Para probar la **resiliencia** (caída de base de datos):
1.  Inicia el test k6.
2.  En otra terminal: `docker stop gestor_lab_postgres`.
3.  Verifica en http://localhost:5173/admin/logs que el sistema sigue funcionando (gracias a Redis).
4.  Restaura la base de datos: `docker start gestor_lab_postgres`.
