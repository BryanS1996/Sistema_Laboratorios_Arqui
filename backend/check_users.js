require('dotenv').config();
const { admin, db } = require('./src/config/firebase.config');
const UserDAO = require('./src/daos/firestore/UserFirestoreDAO');

async function main() {
    console.log("🔍 Checking Users State...");

    try {
        // 1. List Firebase Auth Users
        console.log("\n--- Firebase Authentication Users ---");
        const listUsersResult = await admin.auth().listUsers(10);
        listUsersResult.users.forEach((userRecord) => {
            console.log(`UID: ${userRecord.uid} | Email: ${userRecord.email} | Disabled: ${userRecord.disabled}`);
        });

        // 2. List Firestore Users
        console.log("\n--- Firestore Users Collection ---");
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log("No users found in Firestore.");
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`ID: ${doc.id} | Email: ${data.email} | Role: ${data.role}`);
            });
        }

    } catch (error) {
        console.error("Error checking users:", error);
    } finally {
        process.exit();
    }
}

main();
