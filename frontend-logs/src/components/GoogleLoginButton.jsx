import { useState, useEffect } from 'react';
import { googleLogin } from '../lib/api';

/**
 * GoogleLoginButton con FIX CRÍTICO de retry logic
 * Soluciona el problema de SDK de Google no cargando inmediatamente
 */
export default function GoogleLoginButton({ onSuccess, onError }) {
    const [isLoading, setIsLoading] = useState(false);
    const [sdkReady, setSdkReady] = useState(false);
    const [initError, setInitError] = useState(null);

    useEffect(() => {
        // FIX CRÍTICO: Retry logic para SDK de Google
        let retryCount = 0;
        const maxRetries = 20; // Max 10 segundos (20 * 500ms)

        const checkGoogleSDK = () => {
            if (window.google?.accounts?.id) {
                console.log('✅ Google SDK loaded');
                setSdkReady(true);
                initializeGoogle();
            } else {
                retryCount++;
                if (retryCount < maxRetries) {
                    console.log(`⏳ Waiting for Google SDK... (attempt ${retryCount}/${maxRetries})`);
                    setTimeout(checkGoogleSDK, 500); // Retry cada 500ms
                } else {
                    console.error('❌ Google SDK failed to load after 10 seconds');
                    setInitError('Google SDK no pudo cargarse. Revisa tu conexión a internet.');
                }
            }
        };

        const timer = setTimeout(checkGoogleSDK, 100);
        return () => clearTimeout(timer);
    }, []);

    const initializeGoogle = () => {
        try {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

            if (!clientId) {
                setInitError('GOOGLE_CLIENT_ID no configurado en .env');
                console.error('❌ VITE_GOOGLE_CLIENT_ID not found in environment');
                return;
            }

            console.log('🔧 Initializing Google with client ID:', clientId.substring(0, 20) + '...');

            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredentialResponse,
            });

            window.google.accounts.id.renderButton(
                document.getElementById('googleSignInButton'),
                {
                    theme: 'filled_blue',
                    size: 'large',
                    text: 'signin_with',
                    width: 300
                }
            );

            console.log('✅ Google button rendered successfully');
        } catch (error) {
            console.error('❌ Error initializing Google:', error);
            setInitError(error.message);
        }
    };

    const handleCredentialResponse = async (response) => {
        console.log('🔐 Google credential received');
        setIsLoading(true);

        try {
            const data = await googleLogin(response.credential);
            console.log('✅ Login successful:', data.user?.email);

            // Verificar que sea admin
            if (data.user?.role !== 'admin') {
                console.error('❌ User is not admin:', data.user?.role);
                throw new Error('Solo administradores pueden acceder a esta aplicación');
            }

            onSuccess && onSuccess(data);
        } catch (error) {
            console.error('❌ Google login error:', error);
            onError && onError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {initError && (
                <div style={{
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    padding: '12px',
                    maxWidth: '400px',
                    color: '#c00'
                }}>
                    <strong>Error de Configuración:</strong> {initError}
                </div>
            )}

            {!sdkReady && !initError && (
                <div style={{ textAlign: 'center', color: '#666' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #e0e0e0',
                        borderTop: '2px solid #2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 8px'
                    }}></div>
                    <p style={{ fontSize: '14px' }}>Cargando Google Sign-In...</p>
                </div>
            )}

            {isLoading && (
                <div style={{ color: '#2563eb', fontWeight: '500' }}>
                    Autenticando...
                </div>
            )}

            <div
                id="googleSignInButton"
                style={{
                    opacity: (!sdkReady || initError) ? 0.5 : 1,
                    transition: 'opacity 0.3s'
                }}
            ></div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
