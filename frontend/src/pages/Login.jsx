import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom'
=======
import { useNavigate, Link } from 'react-router-dom'
>>>>>>> test
import { apiFetch, setToken } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { UCELogoImage } from '../components/UCELogoImage'
import { User, Loader } from 'lucide-react'
import { signInWithGoogle } from '../lib/firebase'
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
    console.log('Login component mounted - v2')
  }, [])

  const addLog = (msg) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])

  useEffect(() => {
    gsap.fromTo(".login-card",
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
    )
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setDebugLog([])
    addLog('Iniciando login (Proxy Backend)...')

    try {
      // Enviar credenciales directamente al backend
      // El backend se encargará de validar con Firebase
      addLog(`Enviando credenciales a /auth/login para: ${email}`)

      const r = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false
      })
<<<<<<< HEAD

      addLog('Respuesta recibida del backend')

      if (!r.accessToken) {
        throw new Error('No se recibió accessToken del servidor. Respuesta: ' + JSON.stringify(r))
      }

      addLog('Token de sesión recibido. Guardando...')
      setToken(r.accessToken)

      addLog('Login completado. Redirigiendo...')
      setTimeout(() => {
        navigate('/reservas')
      }, 1000)

    } catch (err) {
      console.error('❌ Login error:', err)
      const msg = err.message || 'Error al iniciar sesión'
      addLog(`ERROR: ${msg}`)
      setError(msg)
=======
      setToken(r.accessToken)
      login(r.user)
      navigate('/reservas')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      const { idToken } = await signInWithGoogle()
      const r = await apiFetch('/auth/firebase', {
        method: 'POST',
        body: { idToken },
        auth: false
      })
      setToken(r.accessToken)
      login(r.user)
      navigate('/reservas')
    } catch (err) {
      console.error(err)
      setError('Error al iniciar sesión con Google')
>>>>>>> test
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
<<<<<<< HEAD
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="ejemplo@uce.edu.ec"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="••••••"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white font-medium hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link className="font-medium text-gray-900 underline" to="/register">
            Regístrate
          </Link>
        </div>

        {/* Debug Log Area */}
        <div className="mt-6 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60 border border-gray-300">
          <div className="font-bold border-b border-gray-300 pb-1 mb-2">Debug Log (Toma foto de esto si falla):</div>
          {debugLog.length === 0 ? <div className="text-gray-400">Esperando acción...</div> : debugLog.map((log, i) => (
            <div key={i} className="mb-1 border-b border-gray-200 pb-1 last:border-0">{log}</div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 border p-3 text-xs text-gray-600">
          <div className="font-semibold">Tip</div>
          <div>Configura <span className="font-mono">VITE_API_URL</span> en <span className="font-mono">frontend/.env</span> si tu backend no está en localhost:3000.</div>
=======
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

            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95 duration-200"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                Ingresar con Google
              </button>
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
>>>>>>> test
        </div>
      </div>
    </div>
  )
}
