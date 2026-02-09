import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
<<<<<<< HEAD
import Catalogo from './pages/Catalogo';
import Reservas from './pages/Reservas';
import Reportes from './pages/Reportes';
import ProtectedRoute from './components/ProtectedRoute';
=======
// import Reservas from './pages/Reservas'; // Deprecated
import CreateReservation from './pages/reservas/CreateReservation';
import LaboratoryCatalog from './pages/reservas/LaboratoryCatalog';
import AllReservations from './pages/reservas/AllReservations';
import MyReservations from './pages/reservas/MyReservations';
import AcademicManagement from './pages/AcademicManagement';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
>>>>>>> test

export default function App() {
  return (
    <AuthProvider>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Navigate to="/catalogo" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/catalogo"
          element={
            <ProtectedRoute>
              <Catalogo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservas"
          element={
            <ProtectedRoute>
              <Reservas />
=======
        <Route path="/" element={<Navigate to="/reservas/catalog" replace />} />

        <Route path="/login" element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        } />
        <Route path="/register" element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        } />

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
>>>>>>> test
            </ProtectedRoute>
          }
        />

        <Route
<<<<<<< HEAD
          path="/reportes"
          element={
            <ProtectedRoute>
              <Reportes />
=======
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
>>>>>>> test
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
