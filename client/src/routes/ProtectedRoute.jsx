import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';

/** UX guard only — every endpoint is also protected on the server. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking your session…" />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, message: 'Sign in to continue.' }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
