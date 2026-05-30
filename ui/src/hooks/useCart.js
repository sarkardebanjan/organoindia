import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { cartApi } from '../api/cartApi';
import { useAuthStore } from '../store/authStore';

export const cartQueryKey = ['cart'];

export const useCart = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const authenticated = useAuthStore((state) => Boolean(state.accessToken));

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: cartApi.get,
    enabled: authenticated,
  });

  const requireAuth = (returnUrl) => {
    if (!authenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return false;
    }
    return true;
  };

  const addMutation = useMutation({
    mutationFn: cartApi.add,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previous = queryClient.getQueryData(cartQueryKey);
      queryClient.setQueryData(cartQueryKey, (current = { items: [] }) => ({
        ...current,
        items: [...(current.items ?? []), { ...item, optimistic: true }],
      }));
      return { previous };
    },
    onError: (_error, _item, context) => {
      queryClient.setQueryData(cartQueryKey, context?.previous);
      enqueueSnackbar('Could not update cart', { variant: 'error' });
    },
    onSuccess: () => enqueueSnackbar('Added to cart', { variant: 'success' }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => cartApi.updateItem(itemId, { quantity }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: cartApi.removeItem,
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartQueryKey }),
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    requireAuth,
    addItem: addMutation.mutate,
    updateItem: updateMutation.mutate,
    removeItem: removeMutation.mutate,
    count: cartQuery.data?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0,
  };
};
