// ProtectedRoute component for QUANTA
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    const from = location.pathname + location.search;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <Outlet />;
}
