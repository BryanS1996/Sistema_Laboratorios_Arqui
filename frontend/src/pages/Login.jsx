import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch, setToken } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { UCELogoImage } from '../components/UCELogoImage'
import { User, Loader } from 'lucide-react'
import GoogleLogin from '../components/GoogleLogin'
import gsap from 'gsap'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugLog, setDebugLog] = useState([])

  useEffect(() => {
    // Animate login card entrance
    gsap.fromTo(".login-card",
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
    )
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const r = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false
      })

      setToken(r.accessToken)
      login(r.user)
      navigate('/reservas')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center p-4 z-10">
      <div className="login-card w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex flex-col overflow-hidden">

        {/* Header Content */}
        <div className="text-center p-8 pb-4 shrink-0 border-b border-gray-100/50">
          <div className="flex justify-center mb-4">
            <UCELogoImage className="w-20 h-auto drop-shadow-sm" />
          </div>
          <h1 className="text-blue-900 text-2xl font-bold tracking-tight">
            Bienvenido
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Ingresa tus credenciales
          </p>
        </div>

        {/* Scrollable Form Area */}
        <div className="p-8 pt-6 flex-1">
          <form onSubmit={onSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-gray-700 font-semibold text-sm">Correo Electrónico</label>
              <input
                type="email"
                placeholder="usuario@uce.edu.ec"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-700 font-semibold text-sm">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader className="animate-spin w-5 h-5" /> : "Iniciar Sesión"}
            </button>

            {/* Google OAuth Login */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">O continuar con</span>
                </div>
              </div>
              <GoogleLogin />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-3">
              <p className="text-center text-sm text-gray-500">¿No tienes cuenta?</p>
              <Link
                to="/register"
                className="w-full flex items-center justify-center py-2.5 px-4 border-2 border-blue-900 text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
