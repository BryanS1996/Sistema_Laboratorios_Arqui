import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Reservas from './pages/Reservas'
import ProtectedRoute from './components/ProtectedRoute'
import { getToken } from './lib/api'

export default function App() {
  const token = getToken()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/reservas' : '/login'} replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/reservas"
        element={(
          <ProtectedRoute>
            <Reservas />
          </ProtectedRoute>
        )}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
