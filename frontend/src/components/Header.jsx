import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'

export default function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center gap-3">
                <img src="/uce-logo.png" alt="UCE Logo" className="h-10 w-auto" />
                <h1 className="text-xl font-bold text-gray-800 hidden md:block">
                    Sistema de Laboratorios
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm text-right hidden sm:block">
                    <p className="font-medium text-gray-900">{user?.nombre}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <button
                    onClick={logout}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </header>
    )
}
