const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    user: process.env.PG_USER || 'lab',
    host: 'localhost', // External access to container mapped port
    database: process.env.PG_DATABASE || 'labdb',
    password: process.env.PG_PASSWORD || 'lab',
    port: 5432,
});

async function listUsers() {
    try {
        await client.connect();
        const res = await client.query('SELECT id, email, role, firebase_uid, created_at FROM users');
        console.log('--- USERS IN DB ---');
        console.table(res.rows);
        console.log('-------------------');
    } catch (err) {
        console.error('Error querying users:', err);
    } finally {
        await client.end();
    }
}

listUsers();
