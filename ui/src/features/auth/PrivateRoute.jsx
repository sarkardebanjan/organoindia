import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PrivateRoute() {
  const location = useLocation();
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));
  if (!authenticated) {
    const returnUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
  }
  return <Outlet />;
}
