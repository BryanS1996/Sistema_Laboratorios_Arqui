import { useState, useEffect, useRef } from 'react';
import { getRecentLogs } from '../lib/api';
import { Clock, User, Activity, Filter, RefreshCw, LogOut } from 'lucide-react';

/**
 * LogsDashboard para App B (standalone)
 * Diseño adaptado de App A pero sin dependencias de AppLayout/routing
 */

const ACTION_COLORS = {
    'LOGIN': 'bg-blue-100 text-blue-800 border-blue-200',
    'LOGOUT': 'bg-gray-100 text-gray-800 border-gray-200',
    'SSO_LOGIN': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'CREATE_RESERVA': 'bg-green-100 text-green-800 border-green-200',
    'UPDATE_RESERVA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'DELETE_RESERVA': 'bg-red-100 text-red-800 border-red-200',
    'CREATE_REPORT': 'bg-purple-100 text-purple-800 border-purple-200',
    'UPDATE_REPORT_STATUS': 'bg-amber-100 text-amber-800 border-amber-200',
    'DEFAULT': 'bg-slate-100 text-slate-800 border-slate-200'
};

export default function LogsDashboard({ user, initialLogs, ssoMode = false }) {
    const [logs, setLogs] = useState(initialLogs || []);
    const [loading, setLoading] = useState(!initialLogs);
    const [error, setError] = useState(null);
    const [filterAction, setFilterAction] = useState('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const pollingIntervalRef = useRef(null);

    // Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.reload();
    };

    // Obtener logs
    const fetchLogs = async (showLoading = true) => {
        // En modo SSO no hacemos polling (ya tenemos los logs iniciales)
        if (ssoMode && initialLogs) {
            return;
        }

        try {
            if (showLoading) setLoading(true);
            setError(null);

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No hay token de autenticación');
                return;
            }

            const data = await getRecentLogs(token, 100);
            setLogs(data.logs || []);
            setLastUpdate(new Date());
        } catch (err) {
            console.error('Error obteniendo logs:', err);
            setError(err.message || 'Error al cargar los logs');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // Carga inicial
    useEffect(() => {
        if (!initialLogs) {
            fetchLogs();
        }
    }, []);

    // Auto-refresh cada 5 segundos (solo en modo login directo, no SSO)
    useEffect(() => {
        if (autoRefresh && !ssoMode) {
            pollingIntervalRef.current = setInterval(() => {
                fetchLogs(false);
            }, 5000);
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [autoRefresh, ssoMode]);

    // Filtrar logs por acción
    const filteredLogs = filterAction === 'all'
        ? logs
        : logs.filter(log => log.action === filterAction);

    // Obtener acciones únicas para el filtro
    const uniqueActions = ['all', ...new Set(logs.map(log => log.action))];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-EC', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getActionColor = (action) => {
        return ACTION_COLORS[action] || ACTION_COLORS.DEFAULT;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                        {ssoMode ? 'Validando sesión SSO...' : 'Cargando logs del sistema...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            {/* SSO Header */}
            {ssoMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-semibold text-blue-900">Modo SSO Activo</p>
                        <p className="text-xs text-blue-700">Sesión de APP A validada correctamente</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-900 bg-clip-text text-transparent">
                                Logs de Auditoría
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Monitoreo en tiempo real del sistema
                            </p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${autoRefresh && !ssoMode
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                            }`}>
                            <div className={`w-2.5 h-2.5 bg-white rounded-full ${autoRefresh && !ssoMode ? 'animate-pulse' : ''} shadow-lg`}></div>
                            <span>{autoRefresh && !ssoMode ? 'LIVE' : 'PAUSADO'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!ssoMode && (
                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${autoRefresh
                                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                            >
                                {autoRefresh ? 'Pausar' : 'Reanudar'}
                            </button>
                        )}
                        <button
                            onClick={() => fetchLogs()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Actualizar
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Salir
                        </button>
                    </div>
                </div>

                {/* Última actualización */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Última actualización: {formatDate(lastUpdate)}</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6 border border-white/20">
                <div className="flex items-center gap-3 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">Filtrar por acción:</span>
                    {uniqueActions.map(action => (
                        <button
                            key={action}
                            onClick={() => setFilterAction(action)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filterAction === action
                                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {action === 'all' ? 'Todos' : action}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 font-semibold">Error: {error}</p>
                </div>
            )}

            {/* Tabla de Logs */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold">Fecha y Hora</th>
                                <th className="px-6 py-4 text-left text-sm font-bold">Acción</th>
                                <th className="px-6 py-4 text-left text-sm font-bold">Usuario</th>
                                <th className="px-6 py-4 text-left text-sm font-bold">IP</th>
                                <th className="px-6 py-4 text-left text-sm font-bold">Detalles</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No hay logs disponibles
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log, index) => (
                                    <tr key={log.id || index} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                            {formatDate(log.created_at || log.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>ID: {log.user_id || log.userId || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            {log.ip_address || log.ipAddress || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                            {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer con contador */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Mostrando <span className="font-bold text-gray-900">{filteredLogs.length}</span> de <span className="font-bold text-gray-900">{logs.length}</span> logs
                    </p>
                </div>
            </div>
        </div>
    );
}
