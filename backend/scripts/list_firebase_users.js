const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

async function listAllUsers(nextPageToken) {
    try {
        const listUsersResult = await admin.auth().listUsers(10, nextPageToken);
        console.log('--- FIREBASE USERS ---');
        listUsersResult.users.forEach((userRecord) => {
            console.log('uid:', userRecord.uid, 'email:', userRecord.email, 'displayName:', userRecord.displayName);
        });
        console.log('----------------------');
        if (listUsersResult.pageToken) {
            listAllUsers(listUsersResult.pageToken);
        }
    } catch (error) {
        console.log('Error listing users:', error);
    }
}

listAllUsers();
