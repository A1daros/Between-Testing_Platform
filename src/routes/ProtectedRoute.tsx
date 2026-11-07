import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../modules/shared/components/Loader';
import { ROUTES } from '../constants/routes';
import type { LoginRedirectState } from '../types/auth';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    const state: LoginRedirectState = { from: location.pathname };

    return <Navigate to={ROUTES.login} state={state} replace />;
  }

  return <Outlet />;
};
