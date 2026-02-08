import { NavLink, useNavigate } from 'react-router-dom'
import { clearTokens } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const linkBase = 'block rounded-lg px-3 py-2 text-sm font-medium'

export default function Sidebar() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  function logout() {
    clearTokens()
    navigate('/login')
  }

  return (
    <aside className="w-64 border-r bg-white">
      <div className="p-4">
        <div className="text-lg font-semibold">Gestor Laboratorio</div>
        <div className="mt-1 text-xs text-gray-500">Frontend básico</div>
      </div>

      <nav className="px-3 pb-4">
        <div className="text-xs font-semibold text-gray-500 px-3 mb-2">MENÚ</div>
        <NavLink
          to="/reservas"
          className={({ isActive }) =>
            `${linkBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
          }
        >
          Mis Reservas
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin/academic"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`
            }
          >
            Gestión Académica
          </NavLink>
        )}

        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg bg-gray-100 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cerrar sesión
        </button>
      </nav>
    </aside>
  )
}
