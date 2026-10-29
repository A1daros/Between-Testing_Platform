import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../modules/Loader';
import { ROUTES } from '../constants/routes';
import { isProfileApproved } from '../utils/isProfileApproved';

export const ApprovedRoute = () => {
  const { loading, profile } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!isProfileApproved(profile)) {
    return <Navigate to={ROUTES.awaitingApproval} replace />;
  }

  return <Outlet />;
};
