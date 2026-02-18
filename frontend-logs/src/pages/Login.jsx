import { useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';

/**
 * Login para App B (Dashboard de Logs Independiente)
 * Soporta 2 métodos de autenticación:
 * 1. Email/Password - Solo para administradores
 * 2. Google OAuth - Solo Google  para administradores
 */
export default function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Error al iniciar sesión');
            }

            const data = await response.json();

            // Verificar que sea admin
            if (data.user.role !== 'admin') {
                throw new Error('Acceso denegado. Solo administradores pueden acceder.');
            }

            onLoginSuccess({
                user: data.user,
                token: data.token
            });
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent mb-2">
                        Dashboard de Logs
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Solo administradores pueden acceder
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-semibold text-center border border-red-100">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold text-sm mb-1.5">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="admin@uce.edu.ec"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold text-sm mb-1.5">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white text-gray-500">O continuar con</span>
                    </div>
                </div>

                {/* Google Login Only */}
                <div>
                    <GoogleLoginButton
                        onSuccess={onLoginSuccess}
                        onError={(err) => setError(err.message)}
                    />
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Si eres administrador, usa tu cuenta institucional.</p>
                </div>
            </div>
        </div>
    );
}
