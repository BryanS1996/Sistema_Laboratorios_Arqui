# 🏗️ Arquitectura Completa del Sistema

Este diagrama detalla la infraestructura y el flujo de datos del **Sistema de Gestión de Laboratorios**, integrando todas las capas de persistencia, caché y monitoreo.

## 🗺️ Diagrama de Arquitectura (C4 - Nivel 2)

```mermaid
graph TB
    subgraph "Capa de Cliente (Navegador)"
        UI["Frontend React (Vite)"]
        Recharts["Recharts (Dashboard Visuals)"]
        UI --- Recharts
    end

    subgraph "Docker Compose Mesh"
        subgraph "Capa de Aplicación"
            API["Backend Express.js"]
            JWT["Middleware Auth (JWT)"]
            CacheMid["Cache Middleware"]
            API --- JWT
            API --- CacheMid
        end

        subgraph "Capa de Caché (In-Memory)"
            Redis[("Redis 7 (Alpine)")]
            RedisComm["Redis Commander (Web UI)"]
            Redis --- RedisComm
        end

        subgraph "Capa de Persistencia (Políglota)"
            Postgres[("PostgreSQL 16\n(Datos Académicos)")]
            Mongo[("MongoDB 7\n(Reservas y Logs)")]
            PGAdmin["pgAdmin 4"]
            ME["Mongo Express"]
            Postgres --- PGAdmin
            Mongo --- ME
        end
    end

    subgraph "Verificación y Carga"
        k6["k6 Stress Testing"]
    end

    %% Flujos de Datos
    UI ==>|HTTPS / REST| API
    JWT -.->|Verificación Token| Postgres
    CacheMid <==>|Read/Write| Redis
    API <==>|Sequelize / SQL| Postgres
    API <==>|Mongoose / NoSQL| Mongo
    k6 -.->|Simulación Saturación| API

    %% Estilos
    style UI fill:#3b82f6,stroke:#fff,color:#fff,stroke-width:2px
    style API fill:#4ade80,stroke:#fff,color:#000,stroke-width:2px
    style Redis fill:#ef4444,stroke:#fff,color:#fff,stroke-width:2px
    style Postgres fill:#336791,stroke:#fff,color:#fff,stroke-width:2px
    style Mongo fill:#47a248,stroke:#fff,color:#fff,stroke-width:2px
    style k6 fill:#f97316,stroke:#fff,color:#fff,stroke-width:2px
```

## 📋 Componentes Clave

### 1. Frontend (React + Vite)
*   **Tecnologías**: React 18, Tailwind CSS, Recharts.
*   **Funcionalidad**: Interfaz administrativa moderna con dashboards en tiempo real y gestión de reservas.
*   **Comunicación**: Polling optimizado cada 2 segundos hacia el backend.

### 2. Backend (Node.js + Express)
*   **Seguridad**: Autenticación vía JWT y Firebase Admin (para notificaciones/auth).
*   **Gestión de Datos**: Implementación del patrón de "Caché de Lectura" mediante un middleware personalizado.

### 3. Capa de Caché (Redis)
*   **Propósito**: Reducción del 90%+ de la carga en base de datos.
*   **Configuración**: Persistencia AOF activa y TTLs dinámicos (5s-30s) según el tipo de dato.

### 4. Persistencia Políglota
*   **PostgreSQL**: Datos estructurados (Usuarios, Carreras, Facultades).
*   **MongoDB**: Datos dinámicos y de alto volumen (Reservas, Reportes, Historial).

### 5. Docker Orchestration
*   Todo el ecosistema corre en una red aislada (`gestor_lab_network`), asegurando que solo sean accesibles los puertos necesarios (3000, 5173, 8082, etc.).

---
> [!NOTE]
> Backblaze ha sido excluido de este diagrama según lo solicitado, enfocándonos exclusivamente en la infraestructura local y de base de datos.
