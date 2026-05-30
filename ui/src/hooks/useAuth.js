import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (tokens) => {
      setTokens(tokens);
      navigate(searchParams.get('returnUrl') || '/', { replace: true });
    },
    onError: (error) => {
      enqueueSnackbar(error.response?.data?.message ?? 'Unable to sign in', {
        variant: 'error',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(refreshToken),
    onSettled: () => {
      clearAuth();
      navigate('/login', { replace: true });
    },
  });

  return {
    user,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginPending: loginMutation.isPending,
  };
};
