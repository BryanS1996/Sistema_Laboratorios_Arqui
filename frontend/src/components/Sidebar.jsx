import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white min-h-screen">
      {/* Logo Area */}
      <div className="flex flex-col items-center justify-center p-6 border-b border-slate-800">
        <div className="mb-2 h-16 w-16 overflow-hidden rounded-full bg-white p-1">
          {/* Placeholder for UCE Logo - You can replace src with actual logo URL or import */}
          <img src="/logo_uce.png" alt="UCE Logo" className="h-full w-full object-contain" onError={(e) => e.target.style.display = 'none'} />
        </div>
        <h1 className="text-center text-xs font-bold tracking-widest text-[#00AEEF]">UNIVERSIDAD CENTRAL DEL ECUADOR</h1>
        <h2 className="mt-1 text-center text-sm font-bold text-white">SISTEMA DE LABORATORIOS</h2>
      </div>

      {/* User Session Card (Top in screenshot, but common pattern is profile accessible) 
          Wait, screenshot shows "SESIÓN ACTIVA" card *below* logo? 
          Actually looks like it's part of the top section or floating.
          Let's put it below the logo section as in the screenshot.
      */}
      <div className="mx-4 mt-6 rounded-xl bg-slate-800/50 p-4 border border-slate-700">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sesión Activa</p>
        <div className="mt-1 font-medium text-white truncate">{user?.email}</div>
        <div className="text-xs text-gray-400 capitalize">Rol: {user?.role || user?.rol || 'Estudiante'}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        <Link
          to="/catalogo"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/catalogo')
            ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Catálogo
        </Link>

        <Link
          to="/reservas"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/reservas')
            ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Mis Reservas
        </Link>

        {/* Placeholder for Reports */}
        <Link
          to="/reportes"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive('/reportes')
            ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
            : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Mis Reportes
        </Link>

      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
