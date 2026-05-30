import { lazy, Suspense, useEffect, useState } from 'react';
import axios from 'axios';
import { CssBaseline, Skeleton, Stack, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import Layout from './components/layout/Layout';
import PrivateRoute from './features/auth/PrivateRoute';
import AdminRoute from './features/auth/AdminRoute';
import { useAuthStore } from './store/authStore';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./features/auth/Login'));
const Register = lazy(() => import('./features/auth/Register'));
const ProductListing = lazy(() => import('./features/products/ProductListing'));
const ProductDetail = lazy(() => import('./features/products/ProductDetail'));
const CartPage = lazy(() => import('./features/cart/CartPage'));
const Checkout = lazy(() => import('./features/checkout/Checkout'));
const OrdersList = lazy(() => import('./features/orders/OrdersList'));
const OrderDetail = lazy(() => import('./features/orders/OrderDetail'));
const Profile = lazy(() => import('./features/profile/Profile'));
const Addresses = lazy(() => import('./features/profile/Addresses'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./features/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./features/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./features/admin/AdminUsers'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteFallback() {
  return (
    <Stack spacing={2} sx={{ p: { xs: 2, md: 4 } }}>
      <Skeleton height={64} />
      <Skeleton height={220} />
      <Skeleton height={120} />
    </Stack>
  );
}

function AuthBootstrap({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [ready, setReady] = useState(!refreshToken || Boolean(accessToken));

  useEffect(() => {
    if (!refreshToken || accessToken) {
      return undefined;
    }
    let cancelled = false;
    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, { refreshToken })
      .then((response) => {
        if (!cancelled) {
          setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken ?? refreshToken,
          });
        }
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, clearAuth, refreshToken, setTokens]);

  if (!ready) return <RouteFallback />;
  return children;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/products', element: <ProductListing /> },
      { path: '/products/:id', element: <ProductDetail /> },
      { path: '/unauthorized', element: <Unauthorized /> },
      {
        element: <PrivateRoute />,
        children: [
          { path: '/cart', element: <CartPage /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/orders', element: <OrdersList /> },
          { path: '/orders/:id', element: <OrderDetail /> },
          { path: '/profile', element: <Profile /> },
          { path: '/profile/addresses', element: <Addresses /> },
        ],
      },
      {
        element: <AdminRoute />,
        children: [
          { path: '/admin', element: <AdminDashboard /> },
          { path: '/admin/products', element: <AdminProducts /> },
          { path: '/admin/orders', element: <AdminOrders /> },
          { path: '/admin/users', element: <AdminUsers /> },
        ],
      },
      { path: '/404', element: <NotFound /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={3500}>
        <QueryClientProvider client={queryClient}>
          <AuthBootstrap>
            <Suspense fallback={<RouteFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </AuthBootstrap>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
