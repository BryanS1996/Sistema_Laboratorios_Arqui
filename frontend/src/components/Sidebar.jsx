import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { isAdmin } = useAuth()

  const linkBase = "block rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
  const activeClass = "bg-indigo-50 text-indigo-700"
  const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900"

  const getLinkClass = ({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-white hidden md:block">
      <div className="flex h-16 items-center justify-center border-b">
        <span className="text-sm font-bold tracking-wider text-gray-500">NAVEGACIÓN</span>
      </div>

      <nav className="p-4 space-y-1">
        <div className="pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reservas</p>
          <NavLink to="/reservas/catalog" className={getLinkClass}>
            Catálogo
          </NavLink>
          <NavLink to="/reservas/all" className={getLinkClass}>
            Disponibilidad
          </NavLink>
          <NavLink to="/reservas/mine" className={getLinkClass}>
            Mis Reservas
          </NavLink>
        </div>

        {isAdmin && (
          <div className="pt-4 border-t">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administración</p>
            <NavLink to="/admin/academic" className={getLinkClass}>
              Gestión Académica
            </NavLink>
            <NavLink to="/admin/users" className={getLinkClass}>
              Gestión de Usuarios
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  )
}

