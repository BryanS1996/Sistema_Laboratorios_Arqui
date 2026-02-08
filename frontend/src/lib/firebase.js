import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

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
