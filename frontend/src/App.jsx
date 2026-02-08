import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
// import Reservas from './pages/Reservas'; // Deprecated
import CreateReservation from './pages/reservas/CreateReservation';
import LaboratoryCatalog from './pages/reservas/LaboratoryCatalog';
import AllReservations from './pages/reservas/AllReservations';
import MyReservations from './pages/reservas/MyReservations';
import AcademicManagement from './pages/AcademicManagement';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas/catalog" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/reservas/catalog" element={
          <ProtectedRoute>
            <LaboratoryCatalog />
          </ProtectedRoute>
        } />

        <Route path="/reservas/new" element={
          <ProtectedRoute>
            <CreateReservation />
          </ProtectedRoute>
        } />
        <Route path="/reservas/all" element={
          <ProtectedRoute>
            <AllReservations />
          </ProtectedRoute>
        } />
        <Route path="/reservas/mine" element={
          <ProtectedRoute>
            <MyReservations />
          </ProtectedRoute>
        } />
        <Route path="/reservas" element={<Navigate to="/reservas/mine" replace />} />

        <Route
          path="/admin/academic"
          element={
            <ProtectedRoute requiredRole="admin">
              <AcademicManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
