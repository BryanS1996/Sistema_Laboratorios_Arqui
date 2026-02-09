import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';

/**
 * Configuración de Firebase
 * 
 * Obtén estos valores desde Firebase Console > Configuración del Proyecto
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase solo si hay API Key
let app, auth;
if (firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (e) {
        console.warn('⚠️ Firebase no pudo inicializarse (falta configuración). El login social no funcionará.');
    }
} else {
    console.warn('⚠️ Falta VITE_FIREBASE_API_KEY. Firebase SDK deshabilitado.');
}

// Exportar seguro (puede ser undefined)
export { auth };
// export default auth; // Avoid default export if named export is better, but usually useful.

// Proveedores
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

/**
 * Iniciar sesión con Google
 */
export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();
        return { user: result.user, idToken };
    } catch (error) {
        console.error('Error al iniciar sesión con Google:', error);
        throw error;
    }
}

/**
 * Iniciar sesión con GitHub
 */
export async function signInWithGithub() {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const idToken = await result.user.getIdToken();
        return { user: result.user, idToken };
    } catch (error) {
        console.error('Error al iniciar sesión con GitHub:', error);
        throw error;
    }
}

/**
 * Iniciar sesión con Email y Contraseña
 */
export async function signInWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await result.user.getIdToken();
        return { user: result.user, idToken };
    } catch (error) {
        console.error('Error al iniciar sesión con Email:', error);
        throw error;
    }
}

/**
 * Registrarse con Email y Contraseña
 */
export async function registerWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await result.user.getIdToken();
        return { user: result.user, idToken };
    } catch (error) {
        console.error('Error al registrarse con Email:', error);
        throw error;
    }
}

/**
 * Cerrar sesión de Firebase
 */
export async function signOut() {
    try {
        if (auth) await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error al cerrar sesión de Firebase:', error);
        throw error;
    }
}

export default auth;
 * Cerrar sesión de Firebase
    */
export async function signOut() {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error al cerrar sesión de Firebase:', error);
        throw error;
    }
}

export default auth;
