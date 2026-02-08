-- Users Table (handling roles and auth)
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth future proofing
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'professor', 'student')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Semesters (e.g., "Septimo Semestre")
CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., 'Septimo Semestre', '2024-1'
    level INTEGER NOT NULL, -- 1, 2, ... 7
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Re-create Subjects to link with Semester
-- We need to handle existing tables if they exist from previous steps
DROP TABLE IF EXISTS student_parallels;
DROP TABLE IF EXISTS professor_subjects;
DROP TABLE IF EXISTS parallels;
DROP TABLE IF EXISTS subjects;

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    semester_id INTEGER REFERENCES semesters(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parallels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professor Assignments (Professor -> Subject)
CREATE TABLE professor_assignments (
    professor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (professor_id, subject_id)
);

-- Student Enrollments (Student -> Parallel)
-- "el estudiante pertenece a un paralelo"
CREATE TABLE student_enrollments (
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parallel_id INTEGER REFERENCES parallels(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, parallel_id)
);
