import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Uses Auth Context to check authentication
 */
export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();
<<<<<<< HEAD
=======
  console.log('ProtectedRoute check:', { user, loading, path: window.location.pathname });
>>>>>>> test

  // Show loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="unauthorized">
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para ver esta página.</p>
      </div>
    );
  }

  return children;
}

/**
 * Admin-only Route shortcut
 */
export function AdminRoute({ children }) {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}
