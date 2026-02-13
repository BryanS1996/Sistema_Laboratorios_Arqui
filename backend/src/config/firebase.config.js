const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
// Necesitas descargar tu clave de cuenta de servicio desde Firebase Console
// y establecer la ruta en la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
// o pasar el objeto de cuenta de servicio directamente

let firebaseApp;

function initializeFirebase() {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Opción 1: Usar ruta de archivo de clave de cuenta de servicio desde entorno
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.applicationDefault(),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        }
        // Opción 2: Usar JSON de cuenta de servicio desde variable de entorno
        else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
        }
        else {
            throw new Error('Credenciales de Firebase no configuradas. Establece la variable de entorno GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT.');
        }

        console.log('✅ Firebase Admin inicializado exitosamente');
        return firebaseApp;
    } catch (error) {
        console.error('❌ Error al inicializar Firebase:', error.message);
        throw error;
    }
}

// Inicializar al cargar el módulo
initializeFirebase();

// Exportar instancia de Firestore
const db = admin.firestore();

// Configurar ajustes de Firestore
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
