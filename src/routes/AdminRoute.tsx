import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../modules/Loader';

export const AdminRoute = () => {
  const { loading, profile } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!profile) {
    return <Navigate to='/' replace />;
  }

  if (profile.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  return <Outlet />;
};
