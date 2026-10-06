import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

/** Unread count for the bell / nav badges. undefined until the first response. Polls quietly every 30s. */
export function useUnreadCount() {
  const { user } = useAuth();
  const enabled = user?.role === 'CUSTOMER' || user?.role === 'VENDOR';
  const query = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => api('/api/notifications/unread-count'),
    select: (data) => data.count,
    enabled,
    refetchInterval: 30_000,
    retry: false,
    meta: { silent: true },
  });
  return enabled ? query.data : undefined;
}

export function useNotificationActions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markRead = useMutation({
    mutationFn: (id) => api(`/api/notifications/${id}/read`, { method: 'PUT' }),
    onSuccess: refresh,
  });
  const markAll = useMutation({
    mutationFn: () => api('/api/notifications/read-all', { method: 'PUT' }),
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  return { markRead, markAll };
}

/** Where a notification should take the user. */
export function notificationTarget(role, notification) {
  if (role === 'VENDOR') return '/vendor/orders';
  return notification.orderId ? `/account/orders/${notification.orderId}` : '/account/notifications';
}
