import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch, setToken } from '../lib/api'
=======
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import { getSemesters, getParallelNamesBySemester, getAllSubjects } from '../lib/academic'
import { UCELogoImage } from '../components/UCELogoImage'
import { Loader, User, BookOpen, GraduationCap } from 'lucide-react'
import gsap from 'gsap'
>>>>>>> test

export default function Register() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Role Selection
  const [role, setRole] = useState('student') // 'student' | 'professor'

  // Student Data
  const [semesters, setSemesters] = useState([])
  const [semesterId, setSemesterId] = useState('')
  const [parallels, setParallels] = useState([])
  const [parallelName, setParallelName] = useState('')

  // Professor Data
  const [subjects, setSubjects] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
<<<<<<< HEAD
    console.log('Register component mounted - v2')
  }, [])

=======
    // Animate register card entrance
    gsap.fromTo(".register-card",
      { opacity: 0, y: 20, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
    )
    loadSemesters()
    loadSubjects()
  }, [])

  useEffect(() => {
    if (semesterId) loadParallels()
    else setParallels([])
  }, [semesterId])

  async function loadSemesters() {
    try { setSemesters(await getSemesters()) }
    catch (e) { console.error("Error loading semesters", e) }
  }

  async function loadParallels() {
    try {
      const result = await getParallelNamesBySemester(semesterId)
      setParallels(result)
    } catch (e) { console.error(e) }
  }

  async function loadSubjects() {
    try { setSubjects(await getAllSubjects()) }
    catch (e) { console.error("Error loading subjects", e) }
  }

  function toggleSubject(subjectId) {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

>>>>>>> test
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

    if (role === 'student') {
      if (!semesterId) {
        setError('Selecciona tu semestre')
        return
      }
      if (!parallelName) {
        setError('Selecciona tu paralelo')
        return
      }
    }

    if (role === 'professor') {
      if (selectedSubjects.length === 0) {
        setError('Selecciona al menos una asignatura')
        return
      }
    }

    setLoading(true)
    try {
<<<<<<< HEAD
      // Registrar directamente en el backend (que se encarga de Firebase)
      const r = await apiFetch('/auth/register', {
        method: 'POST',
        body: { email: emailNorm, password, nombre },
=======
      const payload = {
        nombre,
        email: emailNorm,
        password,
        role
      }

      if (role === 'student') {
        payload.semesterId = semesterId;
        payload.parallelName = parallelName;
      } else if (role === 'professor') {
        payload.subjectIds = selectedSubjects;
      }

      await apiFetch('/auth/register', {
        method: 'POST',
        body: payload,
>>>>>>> test
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
<<<<<<< HEAD
      console.error('❌ Register error:', err)
      let msg = err.message
      if (msg.includes('Email ya registrado')) {
        msg = 'El email ya está registrado.'
      } else if (msg.includes('weak-password')) {
        msg = 'La contraseña es muy débil (mínimo 6 caracteres).'
      }
      setError(msg)
=======
      setError(err.message || 'Error al crear cuenta')
>>>>>>> test
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-1 items-center justify-center p-4 z-10">
      <div className="register-card w-full max-w-md max-h-[700px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 flex flex-col overflow-hidden">

        <div className="text-center p-8 pb-4 shrink-0 border-b border-gray-100/50">
          <div className="flex justify-center mb-4">
            <UCELogoImage className="w-16 h-auto drop-shadow-sm" />
          </div>
          <h1 className="text-blue-900 text-2xl font-bold tracking-tight">
            Crear Cuenta
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Registro para estudiantes y docentes
          </p>
        </div>

        <div className="p-8 pt-6 flex-1 overflow-y-auto">
          <form onSubmit={onSubmit} className="space-y-4">

            {/* Role Selection Tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'student'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <GraduationCap size={18} />
                Estudiante
              </button>
              <button
                type="button"
                onClick={() => setRole('professor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'professor'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <BookOpen size={18} />
                Profesor
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-gray-700 font-semibold text-sm">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Juan Perez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>

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

            {/* Conditional Fields based on Role */}
            {role === 'student' ? (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-gray-700 font-semibold text-sm">Semestre</label>
                  <select
                    required
                    value={semesterId}
                    onChange={e => setSemesterId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {semesters.map(s => <option key={s.id} value={s.id}>{s.name} ({s.level}°)</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-700 font-semibold text-sm">Paralelo</label>
                  <select
                    required
                    value={parallelName}
                    onChange={e => setParallelName(e.target.value)}
                    disabled={!semesterId}
                    className="w-full px-3 py-2 bg-white/50 border border-gray-200 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Seleccionar...</option>
                    {parallels.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-gray-700 font-semibold text-sm">Asignaturas que dicta</label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg bg-white/50 p-2 space-y-1">
                  {subjects.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Cargando asignaturas...</p>}
                  {subjects.map(sub => (
                    <label key={sub.id} className="flex items-center gap-2 p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="rounded text-blue-900 focus:ring-blue-900"
                        checked={selectedSubjects.includes(sub.id)}
                        onChange={() => toggleSubject(sub.id)}
                      />
                      <span className="text-sm text-gray-700">{sub.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-right">{selectedSubjects.length} seleccionadas</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? <Loader className="animate-spin w-5 h-5" /> : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="text-blue-900 font-semibold text-sm hover:text-blue-700 transition-colors hover:underline underline-offset-4"
            >
              ← ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
