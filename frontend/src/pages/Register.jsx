import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch, setToken } from '../lib/api'

export default function Register() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('Register component mounted - v2')
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    // Validación extra de email
    const emailNorm = String(email || '').trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!emailRegex.test(emailNorm)) {
      setError('Email inválido')
      return
    }

    setLoading(true)
    try {
      // Registrar directamente en el backend (que se encarga de Firebase)
      const r = await apiFetch('/auth/register', {
        method: 'POST',
        body: { email: emailNorm, password, nombre },
        auth: false
      })

      // El backend ahora devuelve { user: ... } y opcionalmente tokens si hace auto-login
      // Pero si auth.controller.register solo devuelve user, necesitamos hacer login
      // Revisemos auth.controller.js: Returns { user }. No tokens.

      // Entonces hacemos login automático
      const loginResp = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email: emailNorm, password },
        auth: false
      })

      if (!loginResp.accessToken) {
        throw new Error('Cuenta creada, pero error al iniciar sesión automática.')
      }

      setToken(loginResp.accessToken)
      navigate('/reservas')

    } catch (err) {
      console.error('❌ Register error:', err)
      let msg = err.message
      if (msg.includes('Email ya registrado')) {
        msg = 'El email ya está registrado.'
      } else if (msg.includes('weak-password')) {
        msg = 'La contraseña es muy débil (mínimo 6 caracteres).'
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-gray-500">Regístrate para empezar.</p>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-700">Nombre</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
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
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link className="font-medium text-gray-900 underline" to="/login">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
