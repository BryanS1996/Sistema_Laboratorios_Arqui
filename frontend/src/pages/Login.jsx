import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, setToken } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugLog, setDebugLog] = useState([])

  useEffect(() => {
    console.log('Login component mounted - v2')
  }, [])

  const addLog = (msg) => setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-gray-500">Accede para gestionar tus reservas.</p>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
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
        </div>
      </div>
    </div>
  )
}
