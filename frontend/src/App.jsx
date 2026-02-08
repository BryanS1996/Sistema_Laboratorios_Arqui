import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Reservas from './pages/Reservas';
import AcademicManagement from './pages/AcademicManagement';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/academic"
          element={
            <ProtectedRoute requiredRole="admin">
              <AcademicManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
