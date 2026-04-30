import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function normalizeRole(role) {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
}

export default function ProtectedRoute({ children, roles }) {
  const { session, user, loading, getHomePath } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6 text-center text-text-muted">Checking session...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRoles = Array.isArray(roles) ? roles.map(normalizeRole).filter(Boolean) : [];

  if (normalizedRoles.length > 0 && !normalizedRoles.includes(normalizeRole(user?.role))) {
    const homePath = getHomePath();
    const safePath = homePath && homePath !== location.pathname ? homePath : '/';
    return <Navigate to={safePath} replace />;
  }

  return children;
}
