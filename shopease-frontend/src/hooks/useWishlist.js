import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const IDS_KEY = ['wishlist', 'ids'];

/** Wishlist ids for the logged-in customer (empty for everyone else) plus a toggle (love / unlove) action. */
export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const enabled = user?.role === 'CUSTOMER';

  const query = useQuery({
    queryKey: IDS_KEY,
    queryFn: () => api('/api/wishlist', { params: { size: 100 } }),
    enabled,
  });

  const ids = new Set((query.data?.content ?? []).map((item) => item.product.id));

  const toggle = useMutation({
    mutationFn: async (productId) => {
      const removing = ids.has(productId);
      if (removing) await api(`/api/wishlist/${productId}`, { method: 'DELETE' });
      else await api('/api/wishlist', { method: 'POST', body: { productId } });
      return { removed: removing };
    },
    // flip the heart immediately; roll back if the server says no
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: IDS_KEY });
      const previous = queryClient.getQueryData(IDS_KEY);
      queryClient.setQueryData(IDS_KEY, (old) => {
        const content = old?.content ?? [];
        const present = content.some((item) => item.product.id === productId);
        return { ...(old ?? {}), content: present ? content.filter((item) => item.product.id !== productId) : [...content, { id: -productId, product: { id: productId } }] };
      });
      return { previous };
    },
    onError: (error, _productId, context) => {
      if (context?.previous) queryClient.setQueryData(IDS_KEY, context.previous);
      toast.error(error.message);
    },
    onSuccess: ({ removed }) => toast.success(removed ? 'Removed from your wishlist' : 'Saved to your wishlist'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  return { enabled, ids, toggle };
}
