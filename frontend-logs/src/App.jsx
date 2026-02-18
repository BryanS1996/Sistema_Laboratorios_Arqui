import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { validateSSOToken } from './lib/api';
import LogsDashboard from './pages/LogsDashboard';
import Login from './pages/Login';

/**
 * App B - Dashboard de Logs Independiente
 * 
 * Modos de acceso:
 * 1. SSO desde App A: ?token=JWT → Valida token y muestra logs
 * 2. Login directo con email/password (solo admins)
 * 3. Login directo con Google OAuth (solo admins)
 */
export default function App() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const ssoToken = searchParams.get('token');

    useEffect(() => {
        if (ssoToken) {
            // Modo SSO: validar token de App A
            console.log('🔐 SSO mode detected - validating token...');

            validateSSOToken(ssoToken)
                .then(data => {
                    console.log('✅ SSO validation successful:', data.user?.email);
                    setUser(data.user);
                    setLogs(data.logs);
                    setLoading(false);

                    // Persistir sesión para sobrevivir al F5
                    localStorage.setItem('accessToken', ssoToken);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Limpiar token de URL por seguridad
                    setSearchParams({});
                })
                .catch(err => {
                    console.error('❌ SSO validation failed:', err);
                    setError(err.message);
                    setLoading(false);
                });
        } else {
            // Modo normal: verificar si ya está autenticado localmente
            const localToken = localStorage.getItem('accessToken');
            const localUser = localStorage.getItem('user');

            if (localToken && localUser) {
                try {
                    setUser(JSON.parse(localUser));
                } catch (e) {
                    console.error('Error parsing local user:', e);
                }
            }

            setLoading(false);
        }
    }, [ssoToken, setSearchParams]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                        {ssoToken ? 'Validando sesión SSO...' : 'Cargando...'}
                    </p>
                </div>
            </div>
        );
    }

    // Error state (solo para errores SSO)
    if (error && ssoToken) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold text-red-800 mb-3">Error de Autenticación SSO</h2>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                    >
                        Intentar Login Directo
                    </button>
                </div>
            </div>
        );
    }

    // Si hay usuario: mostrar dashboard
    if (user) {
        return <LogsDashboard user={user} initialLogs={logs} ssoMode={!!ssoToken} />;
    }

    // Sin usuario: mostrar login (email/password o Google)
    return <Login onLoginSuccess={(userData) => {
        setUser(userData.user);
        localStorage.setItem('accessToken', userData.token);
        localStorage.setItem('user', JSON.stringify(userData.user));
    }} />;
}
