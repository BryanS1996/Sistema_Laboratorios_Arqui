-- Create Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Parallels table
CREATE TABLE IF NOT EXISTS parallels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Professor Assignments (Many-to-Many: One professor can have many subjects, one subject can have many professors?)
-- User said "el profesor pertenece a una o mas asignaturas".
-- "la asignatura ya pertenece a algun profesor".
-- Assuming Many-to-Many is safest.
CREATE TABLE IF NOT EXISTS professor_subjects (
    professor_id VARCHAR(255) NOT NULL, -- Firebase UID
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (professor_id, subject_id)
);

-- Student Assignments (Student -> Parallel)
-- "el estudiante pertenece a un paralelo"
CREATE TABLE IF NOT EXISTS student_parallels (
    student_id VARCHAR(255) NOT NULL, -- Firebase UID
    parallel_id INTEGER REFERENCES parallels(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, parallel_id)
);
