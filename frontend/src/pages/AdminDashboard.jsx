import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../lib/api';
import AppLayout from '../components/AppLayout';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

function DashboardContent() {
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState(null);
  const [topUsers, setTopUsers] = useState(null);
  const [commonHours, setCommonHours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Carga inicial
  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  // Polling cada 2 segundos para actualizaciones en tiempo real
  useEffect(() => {
    // Iniciar polling
    pollingIntervalRef.current = setInterval(() => {
      fetchDashboardData(false); // false = no mostrar estado de carga durante el polling
    }, 2000);

    // Limpiar polling al desmontar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [timeRange]);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const data = await apiFetch(`/dashboard/all?timeRange=${timeRange}`, { auth: true });

      setStats(data.stats || {});
      setTopUsers(data.topUsers || []);
      setCommonHours(data.commonHours || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error al cargar datos del dashboard');
      // Establecer valores por defecto vacíos
      setStats({});
      setTopUsers([]);
      setCommonHours([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-yellow-900 mb-2">Aviso al cargar datos</h2>
          <p className="text-yellow-800 mb-4">Error: {error}</p>
          <p className="text-yellow-700 text-sm mb-4">
            Verifica que el backend esté corriendo y que haya datos de reservas en la base de datos.
          </p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Reintentar
          </button>
        </div>
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-center">Mostrando vista vacía mientras se resuelve el problema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Reservas</h1>
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Tiempo Real
          </div>
        </div>

        {/* Selector de Rango de Tiempo */}
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === 'day' ? 'Hoy' : range === 'week' ? 'Esta semana' : 'Este mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservas por Laboratorio - Gráfico Superior Ancho Completo (Abarcar 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Reservas por Laboratorio</h2>
          {stats?.byLab && stats.byLab.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.byLab}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="lab"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} reservas`, 'Cantidad']}
                  labelFormatter={(label) => `Lab: ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#3b82f6" 
                  name="Reservas"
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Tarjeta Total de Reservas - Barra Lateral */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 flex flex-col justify-center">
          <p className="text-sm font-medium opacity-90">Total de Reservas</p>
          <p className="text-5xl font-bold mt-4">{stats?.total || 0}</p>
          <p className="text-sm mt-4 opacity-75">
            {timeRange === 'day'
              ? 'en las últimas 24h'
              : timeRange === 'week'
                ? 'en los últimos 7 días'
                : 'en los últimos 30 días'}
          </p>
        </div>

        {/* Gráfico de Reservas por Día */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Reservas por Día</h2>
          {stats?.byDay && stats.byDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.byDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Reservas"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Top 5 Usuarios */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Top 5 Usuarios</h2>
          {topUsers && topUsers.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {topUsers.map((user, index) => (
                <div key={user.userId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-center w-7 h-7 bg-blue-500 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{user.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-blue-600 text-sm">{user.reservations}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Horarios Más Frecuentes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Horarios Frecuentes</h2>
          {commonHours && commonHours.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={commonHours.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={(item) => `${item.horaInicio}-${item.horaFin}`}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Reservas']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="count" fill="#10b981" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Horas por Hora del Día - Ancho Completo */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Distribución por Hora del Día</h2>
          {stats?.byHour && stats.byHour.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Reservas']}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Bar dataKey="count" fill="#f59e0b" name="Reservas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}
