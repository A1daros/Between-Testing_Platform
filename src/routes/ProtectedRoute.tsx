import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../modules/shared/components/Loader';
import { ErrorState } from '../modules/shared/components/ErrorState';
import { ROUTES } from '../constants/routes';
import type { LoginRedirectState } from '../types/auth';

export const ProtectedRoute = () => {
  const { user, loading, profileLoadFailed, retryProfileLoad } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    const state: LoginRedirectState = { from: location.pathname };

    return <Navigate to={ROUTES.login} state={state} replace />;
  }

  if (profileLoadFailed) {
    return (
      <ErrorState
        message='Не вдалося завантажити дані акаунта. Перевірте підключення до інтернету й спробуйте ще раз.'
        onAction={retryProfileLoad}
      />
    );
  }

  return <Outlet />;
};
