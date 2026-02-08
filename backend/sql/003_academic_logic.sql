-- 1. Add firebase_uid to users for sync (if needed)
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;

-- 2. Laboratories (Physical spaces)
DROP TABLE IF EXISTS laboratories CASCADE;
CREATE TABLE laboratories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    capacidad INTEGER NOT NULL DEFAULT 0,
    ubicacion VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Schedules (Horarios) - linking Parallels to Labs
-- Un paralelo tiene un horario en un laboratorio específico
DROP TABLE IF EXISTS schedules CASCADE;
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    parallel_id INTEGER REFERENCES parallels(id) ON DELETE CASCADE,
    lab_id INTEGER REFERENCES laboratories(id) ON DELETE CASCADE,
    dia VARCHAR(20) NOT NULL, -- 'Lunes', 'Martes', etc.
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_times CHECK (hora_fin > hora_inicio)
);

-- Index for faster conflict detection
CREATE INDEX IF NOT EXISTS idx_schedules_conflict 
ON schedules(lab_id, dia, hora_inicio, hora_fin);
