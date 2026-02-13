import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, setToken } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

/**
 * Google Login Component
 * Uses Google Sign-In JavaScript Library to authenticate users
 * Requires VITE_GOOGLE_CLIENT_ID environment variable
 */
export default function GoogleLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Initialize Google Sign-In and handle authentication
     */
    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: async (response) => {
                    setLoading(true);
                    try {
                        if (!response.credential) throw new Error('No se recibió la credencial');
                        const result = await apiFetch('/auth/google', {
                            method: 'POST',
                            body: { idToken: response.credential },
                            auth: false
                        });
                        setToken(result.accessToken);
                        login(result.user);
                        navigate('/reservas');
                    } catch (err) {
                        console.error('Google login error detail:', err);
                        setError(err.message || 'Error al iniciar sesión con Google');
                    } finally {
                        setLoading(false);
                    }
                }
            });

            // Render the standard button in the container
            window.google.accounts.id.renderButton(
                document.getElementById("google-login-button"),
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    }, []);

    return (
        <div className="w-full flex flex-col items-center">
            {error && (
                <div className="w-full mb-3 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center border border-red-100">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center mb-4">
                    <Loader className="animate-spin w-6 h-6 text-blue-900" />
                    <span className="ml-2 text-sm text-gray-500 font-medium">Autenticando...</span>
                </div>
            )}

            {/* Main Google standard button */}
            <div id="google-login-button" className="w-full flex justify-center"></div>
        </div>
    );
}
