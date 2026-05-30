import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import PrivateRoute from './PrivateRoute';

export default function AdminRoute() {
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  const isAdmin = useAuthStore((state) => state.hasRole('ROLE_ADMIN'));
  if (!authenticated) return <PrivateRoute />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
