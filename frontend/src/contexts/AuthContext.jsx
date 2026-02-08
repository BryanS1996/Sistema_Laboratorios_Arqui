import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout as apiLogout, getToken, setUser as cacheUser, getUser as getCachedUser } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Cargar usuario al montar el componente
    useEffect(() => {
        async function loadUser() {
            const token = getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            // Intentar obtener usuario en caché primero
            const cached = getCachedUser();
            if (cached) {
                setUser(cached);
            }

            // Luego obtener datos frescos del backend
            try {
                const data = await getCurrentUser();
                setUser(data.user);
                cacheUser(data.user);
                setError(null);
            } catch (err) {
                console.error('Error al cargar usuario:', err);
                setError(err.message);
                setUser(null);
                cacheUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
        cacheUser(userData);
    };

    const logout = async () => {
        try {
            await apiLogout();
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        } finally {
            setUser(null);
            cacheUser(null);
        }
    };

    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isStudent
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
}
