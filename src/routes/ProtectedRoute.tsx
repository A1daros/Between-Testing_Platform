import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../modules/Loader';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
};
