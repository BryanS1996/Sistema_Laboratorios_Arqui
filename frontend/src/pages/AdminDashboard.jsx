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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Encabezado Mejorado */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Dashboard de Reservas
            </h1>
            <p className="text-sm text-gray-600 mt-1">Análisis y métricas en tiempo real</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full text-sm font-semibold shadow-lg">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg"></div>
            <span>LIVE</span>
          </div>
        </div>

        {/* Selector de Rango de Tiempo Mejorado */}
        <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-xl">
          {['day', 'week', 'month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${timeRange === range
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                }`}
            >
              {range === 'day' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Gráficos Mejorados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reservas por Laboratorio - Diseño Profesional */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Reservas por Laboratorio</h2>
          </div>
          {stats?.byLab && stats.byLab.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={stats.byLab} margin={{ top: 5, right: 20, left: 20, bottom: 90 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="lab"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  interval={0}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip
                  formatter={(value) => [`${value} reservas`, 'Cantidad']}
                  labelFormatter={(label) => `Laboratorio: ${label}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  dataKey="count"
                  fill="url(#colorGradient)"
                  name="Reservas"
                  animationDuration={800}
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Tarjeta Total de Reservas - Diseño Premium */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white rounded-2xl shadow-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Reservas</p>
            </div>
            <p className="text-6xl font-black mt-2 drop-shadow-lg">{stats?.total || 0}</p>
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-sm font-medium opacity-90">
                {timeRange === 'day' ? 'Últimas 24 horas' : timeRange === 'week' ? 'Últimos 7 días' : 'Últimos 30 días'}
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico de Reservas por Día - Diseño Premium */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tendencia Diaria</h2>
          </div>
          {stats?.byDay && stats.byDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#059669' }}
                  name="Reservas"
                />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Top 5 Usuarios - Diseño Premium */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Top 5 Usuarios</h2>
          </div>
          {topUsers && topUsers.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {topUsers.map((user, index) => (
                <div key={user.userId} className="group flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{user.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{user.count}</p>
                    <p className="text-xs text-gray-400 font-medium">reservas</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Horarios Más Frecuentes - Diseño Profesional */}
        <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Horarios Más Frecuentes (7:00 - 20:00)</h2>
          </div>
          {commonHours && commonHours.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart
                data={commonHours.filter(h => {
                  const hour = parseInt(h.hour?.split(':')[0] || h.hour);
                  return hour >= 7 && hour <= 20;
                })}
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis
                  dataKey="hour"
                  type="category"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                  }}
                  cursor={{ fill: 'rgba(244, 114, 182, 0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  dataKey="count"
                  fill="url(#pinkGradient)"
                  name="Reservas"
                  radius={[0, 8, 8, 0]}
                  animationDuration={800}
                  barSize={25}
                />
                <defs>
                  <linearGradient id="pinkGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
          )}
        </div>

        {/* Horas por Hora del Día - Ancho Completo */}
        <div className="lg:col-span-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Distribución por Hora del Día</h2>
          </div>
          {stats?.byHour && stats.byHour.length > 0 ? (
            <ResponsiveContainer width="98%" height={300}>
              <BarChart data={stats.byHour} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip
                  formatter={(value) => [`${value} reservas`, 'Cantidad']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  dataKey="count"
                  fill="url(#purpleGradient)"
                  name="Reservas"
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
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
