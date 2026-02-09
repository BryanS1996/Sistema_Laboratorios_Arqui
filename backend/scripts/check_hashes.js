const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const client = new Client({
    user: process.env.PG_USER || 'lab',
    host: 'localhost',
    database: process.env.PG_DATABASE || 'labdb',
    password: process.env.PG_PASSWORD || 'lab',
    port: 5432,
});

async function checkHashes() {
    try {
        await client.connect();
        const res = await client.query('SELECT id, email, password_hash, firebase_uid FROM users');
        console.log('--- USERS PASSWORD CHECK ---');
        res.rows.forEach(r => {
            const hasHash = r.password_hash && r.password_hash.length > 0;
            console.log(`Email: ${r.email} | Has Hash: ${hasHash} | Hash Start: ${hasHash ? r.password_hash.substring(0, 10) + '...' : 'NULL'}`);
        });
        console.log('----------------------------');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkHashes();
