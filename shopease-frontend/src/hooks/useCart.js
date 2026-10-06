import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Guests and customers have a cart; vendors and admins do not. */
export function useCart() {
  const { user } = useAuth();
  const enabled = !user || user.role === 'CUSTOMER';
  return useQuery({ queryKey: ['cart'], queryFn: () => api('/api/cart'), enabled });
}

export function useCartActions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const onSuccess = (data) => queryClient.setQueryData(['cart'], data);
  const onError = (error) => toast.error(error.message);

  const add = useMutation({
    mutationFn: ({ productId, quantity = 1 }) =>
      api('/api/cart/items', { method: 'POST', body: { productId, quantity } }),
    onSuccess: (data, variables) => {
      onSuccess(data);
      // The navbar listens for this and shows a small, quiet "Added to cart" note next to the cart icon.
      const item = data.items.find((i) => i.productId === variables.productId);
      window.dispatchEvent(
        new CustomEvent('shopease:cart-added', { detail: { name: item?.productName ?? 'Item', quantity: variables.quantity ?? 1 } }),
      );
    },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ itemId, quantity }) => api(`/api/cart/items/${itemId}`, { method: 'PUT', body: { quantity } }),
    onSuccess,
    onError,
  });

  const remove = useMutation({
    mutationFn: (itemId) => api(`/api/cart/items/${itemId}`, { method: 'DELETE' }),
    onSuccess,
    onError,
  });

  return { add, update, remove };
}
