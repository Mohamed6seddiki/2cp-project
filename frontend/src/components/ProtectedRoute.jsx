import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, roles }) {
  const { session, user, loading, getHomePath } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-text-muted">Checking session...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={getHomePath()} replace />;
  }

  return children;
}
