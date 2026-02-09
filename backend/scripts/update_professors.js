const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.PG_USER || 'lab',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'labdb',
    password: process.env.PG_PASSWORD || 'lab',
    port: process.env.PG_PORT || 5432,
});

const names = [
    "Ing. Juan Pérez", "Dra. María López", "Arq. Carlos Ruiz", "MSc. Ana Torres",
    "Dr. Luis García", "Ing. Sofía Díaz", "Arq. Pedro Sánchez", "Dra. Elena Morales",
    "Ing. Miguel Ángel", "MSc. Laura Castillo", "Dr. José Fernández", "Ing. Carmen Ortiz",
    "Arq. David Romero", "Dra. Isabel Vargas", "Ing. Francisco Ramos", "MSc. Rosa Gil",
    "Dr. Antonio Mendoza", "Ing. Patricia Silva", "Arq. Javier Castro", "Dra. Teresa Ríos",
    "Ing. Ricardo Núñez", "MSc. Beatriz Vega", "Dr. Manuel Peña", "Ing. Adriana Cruz",
    "Arq. Roberto León", "Dra. Claudia Méndez", "Ing. Alejandro Soto", "MSc. Gabriela Pardo",
    "Dr. Fernando Herrera", "Ing. Natalia Solís", "Arq. Martín Cabrera", "Dra. Julia Flores",
    "Ing. Pablo Andrade", "MSc. Verónica Espinoza"
];

function getRandomName() {
    return names[Math.floor(Math.random() * names.length)];
}

async function updateProfessors() {
    try {
        console.log('Fetching professors...');
        const { rows } = await pool.query("SELECT id, email FROM users WHERE role = 'professor'");

        console.log(`Found ${rows.length} professors. Updating names...`);

        for (const prof of rows) {
            let newName = getRandomName();
            // Try to make it unique-ish or consistent? Nah, just random is fine for now.

            await pool.query("UPDATE users SET nombre = $1 WHERE id = $2", [newName, prof.id]);
            console.log(`Updated ${prof.email} -> ${newName}`);
        }

        console.log('All professors updated successfully.');

    } catch (err) {
        console.error('Error updating professors:', err);
    } finally {
        await pool.end();
    }
}

updateProfessors();
