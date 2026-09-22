import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';

export function OwnerRoute() {
  const { isAuthenticated, isOwner, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session…" />;

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location, message: 'Sign in to continue.' }} />
    );
  }

  if (!isOwner) return <Navigate to="/" replace />;

  return <Outlet />;
}

export default OwnerRoute;
