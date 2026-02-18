import { useState, useEffect } from 'react';
import { getRecentLogs } from '../lib/api';

/**
 * LogsDashboard - Muestra logs de auditoría con polling
 */
export default function LogsDashboard({ user, initialLogs, ssoMode }) {
    const [logs, setLogs] = useState(initialLogs || []);
    const [loading, setLoading] = useState(!initialLogs);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch logs (solo si no vino con SSO)
    const fetchLogs = async () => {
        if (ssoMode && initialLogs) {
            // En modo SSO ya tenemos los logs iniciales
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No hay token de autenticación');
                return;
            }

            const data = await getRecentLogs(token);
            setLogs(data.logs || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching logs:', err);
            setError(err.message);

            // Si el token es inválido o expiró, cerrar sesión automáticamente
            if (err.message.includes('Token') || err.message.includes('token') || err.message.includes('401')) {
                console.warn('⚠️ Token inválido detectado. Cerrando sesión...');
                setTimeout(() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    window.location.reload();
                }, 2000); // Dar tiempo a leer el error
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch (solo si no hay initialLogs)
    useEffect(() => {
        if (!initialLogs) {
            fetchLogs();
        }
    }, []);

    // Auto-refresh con polling (cada 5 segundos)
    useEffect(() => {
        if (!autoRefresh || ssoMode) return; // No auto-refresh en SSO mode

        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, [autoRefresh, ssoMode]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Handle logout - App B es independiente
    // Al hacer logout, te quedas en App B (vuelves al login de App B)
    const handleLogout = () => {
        // Limpiar localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        // Recargar página actual (App B) para volver al login
        // NO redirigir a App A - App B es totalmente independiente
        window.location.reload();
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                marginBottom: '24px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '30px',
                            fontWeight: 'bold',
                            color: '#111827',
                            marginBottom: '8px'
                        }}>
                            Dashboard de Logs
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            {ssoMode && '🔐 Modo SSO - '}
                            Usuario: <strong>{user.email}</strong> ({user.role})
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {!ssoMode && (
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: autoRefresh ? '#2563eb' : '#9ca3af',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}
                            >
                                {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>

                <div style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#1e40af'
                }}>
                    <strong>Total de logs:</strong> {logs.length}
                    {ssoMode && ' (cargados via SSO)'}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #e0e0e0',
                        borderTop: '4px solid #2563eb',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    backgroundColor: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#c00'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Logs Table */}
            {!loading && !error && (
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '14px'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Fecha</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Usuario</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Acción</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Entidad</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>IP</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{
                                            padding: '40px',
                                            textAlign: 'center',
                                            color: '#9ca3af'
                                        }}>
                                            No hay logs disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log, index) => (
                                        <tr
                                            key={log.id || index}
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                                            }}
                                        >
                                            <td style={{ padding: '12px', color: '#374151' }}>
                                                {formatDate(log.createdAt || log.created_at)}
                                            </td>
                                            <td style={{ padding: '12px', color: '#374151' }}>
                                                {log.userId || log.user_id || '-'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#dbeafe',
                                                    color: '#1e40af',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '500'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: '#374151' }}>
                                                {log.entityType || log.entity_type || '-'}
                                                {log.entityId && ` #${log.entityId}`}
                                            </td>
                                            <td style={{ padding: '12px', color: '#6b7280', fontFamily: 'monospace', fontSize: '12px' }}>
                                                {log.ipAddress || log.ip_address || '-'}
                                            </td>
                                            <td style={{ padding: '12px', color: '#6b7280', fontSize: '12px', maxWidth: '200px' }}>
                                                {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
