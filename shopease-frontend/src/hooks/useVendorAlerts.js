import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const DEFAULT_TITLE = 'ShopEase – Multi-vendor marketplace';

/**
 * Number of paid orders waiting for the vendor to start processing.
 * Polls quietly every 30 seconds, shows a small toast when a new one arrives, and puts the count in the tab title.
 */
export function useVendorAlerts(enabled) {
  const toast = useToast();
  const previous = useRef(null);

  const { data } = useQuery({
    queryKey: ['vendor-orders', 'alerts'],
    queryFn: () => api('/api/orders', { params: { size: 100 } }),
    select: (page) => page.content.filter((order) => order.status === 'PAID').length,
    enabled,
    refetchInterval: 30_000,
    retry: false,
    meta: { silent: true }, // background polling should not flash the top progress bar
  });

  useEffect(() => {
    if (data === undefined) return;
    if (previous.current !== null && data > previous.current) {
      const fresh = data - previous.current;
      toast.success(fresh === 1 ? 'You have a new order to process' : `You have ${fresh} new orders to process`);
    }
    previous.current = data;
  }, [data, toast]);

  useEffect(() => {
    if (!enabled) return undefined;
    document.title = data > 0 ? `(${data}) New orders · ShopEase` : DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [data, enabled]);

  return enabled ? data ?? 0 : 0;
}
