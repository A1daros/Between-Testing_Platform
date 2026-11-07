import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../modules/shared/components/Loader';
import { ROUTES } from '../constants/routes';

export const AdminRoute = () => {
  const { loading, profile } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
};
