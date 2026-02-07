const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// and set the path in environment variable GOOGLE_APPLICATION_CREDENTIALS
// or pass the service account object directly

let firebaseApp;

function initializeFirebase() {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Option 1: Use service account key file path from environment
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        }
        // Option 2: Use service account JSON from environment variable
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        }
        else {
            throw new Error('Firebase credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT environment variable.');
        }

        console.log('✅ Firebase Admin initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error.message);
        throw error;
    }
}

// Initialize on module load
initializeFirebase();

// Export Firestore instance
const db = admin.firestore();

// Configure Firestore settings
db.settings({
    ignoreUndefinedProperties: true,
    timestampsInSnapshots: true
});

module.exports = {
    admin,
    db,
    auth: admin.auth(),
    FieldValue: admin.firestore.FieldValue,
    Timestamp: admin.firestore.Timestamp
};
