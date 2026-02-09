require("dotenv").config({ path: "../.env" });
const admin = require("firebase-admin");
const { Pool } = require("pg");

// 1. Initialize Firebase
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

// 2. Initialize Postgres
const pool = new Pool({
    user: process.env.PG_USER || "lab",
    host: process.env.PG_HOST || "localhost", // Run from host, use localhost mapped port
    database: process.env.PG_DATABASE || "labdb",
    password: process.env.PG_PASSWORD || "lab",
    port: process.env.PG_PORT || 5432,
});

async function migrate() {
    try {
        console.log("🚀 Starting migration...");

        // Get all users from Firestore
        const snapshot = await db.collection("users").get();
        const users = [];
        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        console.log(`Found ${users.length} users in Firestore.`);

        for (const user of users) {
            const { email, nombre, passwordHash, role } = user;

            try {
                // Insert into Postgres
                const res = await pool.query(
                    `INSERT INTO users (email, nombre, password_hash, role) 
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (email) DO UPDATE SET 
             nombre = EXCLUDED.nombre,
             password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role
           RETURNING id`,
                    [email, nombre, passwordHash, role || 'student']
                );
                console.log(`✅ Migrated: ${email} -> ID: ${res.rows[0].id}`);
            } catch (err) {
                console.error(`❌ Error migrating ${email}:`, err.message);
            }
        }

        console.log("🏁 Migration complete.");
    } catch (error) {
        console.error("Fatal error:", error);
    } finally {
        await pool.end();
        process.exit();
    }
}

migrate();
