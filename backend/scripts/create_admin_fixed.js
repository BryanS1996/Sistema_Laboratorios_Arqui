const admin = require('firebase-admin');
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const serviceAccount = require('../serviceAccountKey.json');
require('dotenv').config({ path: '../.env' });

// Initialize Firebase
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Initialize Postgres
const client = new Client({
    user: process.env.PG_USER || 'lab',
    host: 'localhost',
    database: process.env.PG_DATABASE || 'labdb',
    password: process.env.PG_PASSWORD || 'lab',
    port: 5432,
});

async function createAdmin() {
    const email = 'admin@uce.edu.ec';
    const password = 'password123';
    const name = 'Administrador Sistema';
    let firebaseUid;

    try {
        console.log(`Creating user ${email} in Firebase...`);
        try {
            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName: name,
                emailVerified: true,
            });
            firebaseUid = userRecord.uid;
            console.log('Successfully created new user in Firebase:', firebaseUid);
        } catch (error) {
            if (error.code === 'auth/email-already-exists') {
                console.log('User already exists in Firebase. Fetching UID...');
                const userRecord = await admin.auth().getUserByEmail(email);
                firebaseUid = userRecord.uid;
                // Optional: Update password to ensure it matches
                await admin.auth().updateUser(firebaseUid, { password });
                console.log('Updated existing Firebase user password.');
            } else {
                throw error;
            }
        }

        console.log('Connecting to Postgres...');
        await client.connect();

        // Check if user exists in DB
        const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        const passwordHash = await bcrypt.hash(password, 10);

        if (res.rows.length > 0) {
            console.log('User exists in Postgres. Updating...');
            await client.query(
                'UPDATE users SET firebase_uid = $1, password_hash = $2, role = $3 WHERE email = $4',
                [firebaseUid, passwordHash, 'admin', email]
            );
        } else {
            console.log('Creating user in Postgres...');
            await client.query(
                'INSERT INTO users (email, password_hash, nombre, role, firebase_uid, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
                [email, passwordHash, name, 'admin', firebaseUid]
            );
        }
        console.log('Admin user created/updated successfully in local DB.');
        console.log('---------------------------------------------------');
        console.log(`EMAIL: ${email}`);
        console.log(`PASSWORD: ${password}`);
        console.log('---------------------------------------------------');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await client.end();
        process.exit();
    }
}

createAdmin();
