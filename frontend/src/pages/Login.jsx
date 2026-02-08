import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, setToken } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      console.log('Login response:', r)
      console.log('Access Token:', r.accessToken)
      console.log('User:', r.user)

      setToken(r.accessToken)
      login(r.user) // Actualizar estado global de autenticación
      navigate('/reservas')
    } catch (err) {
      setError(err.message || 'Error')
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
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

        <div className="mt-6 rounded-lg bg-gray-50 border p-3 text-xs text-gray-600">
          <div className="font-semibold">Tip</div>
          <div>Configura <span className="font-mono">VITE_API_URL</span> en <span className="font-mono">frontend/.env</span> si tu backend no está en localhost:3000.</div>
        </div>
      </div>
    </div>
  )
}
