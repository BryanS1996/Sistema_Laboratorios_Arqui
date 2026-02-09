import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  BookmarkCheck,
  GraduationCap,
  Users,
  Settings,
  X // Close icon
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth()

  const linkBase = "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden"
  const activeClass = "bg-blue-50 text-blue-700 shadow-sm"
  const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900"

  const getLinkClass = ({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`

  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:shadow-none md:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b bg-gradient-to-r from-blue-600 to-blue-800">
          <span className="text-sm font-bold tracking-widest text-white mx-auto md:mx-0">NAVEGACIÓN</span>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="text-white md:hidden hover:bg-white/20 rounded p-1">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="pb-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Reservas</p>
            <NavLink to="/reservas/catalog" className={getLinkClass} onClick={onClose}>
              <LayoutDashboard size={18} />
              Catálogo
            </NavLink>
            <NavLink to="/reservas/all" className={getLinkClass} onClick={onClose}>
              <CalendarDays size={18} />
              Disponibilidad
            </NavLink>
            <NavLink to="/reservas/mine" className={getLinkClass} onClick={onClose}>
              <BookmarkCheck size={18} />
              Mis Reservas
            </NavLink>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t space-y-1">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
              <NavLink to="/admin/academic" className={getLinkClass} onClick={onClose}>
                <GraduationCap size={18} />
                Gestión Académica
              </NavLink>
              <NavLink to="/admin/users" className={getLinkClass} onClick={onClose}>
                <Users size={18} />
                Gestión de Usuarios
              </NavLink>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}

