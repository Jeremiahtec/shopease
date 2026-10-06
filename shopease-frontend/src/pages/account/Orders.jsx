import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, PackageCheck, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, money } from '../../lib/format';
import { Button, EmptyState, ErrorState, Input, PageLoader, Pagination, StatusBadge } from '../../components/ui';
import TrackModal from './TrackModal';

export default function Orders() {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [tracking, setTracking] = useState(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const arrive = useMutation({
    mutationFn: (id) => api(`/api/orders/${id}/status`, { method: 'PUT', body: { status: 'DELIVERED' } }),
    onSuccess: () => {
      toast.success('Thanks for confirming! Your order is marked as delivered.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const orders = useQuery({
    queryKey: ['orders', 'list', page],
    queryFn: () => api('/api/orders', { params: { page, size: 8 } }),
    placeholderData: keepPreviousData,
  });

  if (orders.isPending) return <PageLoader />;
  if (orders.isError) return <ErrorState error={orders.error} onRetry={orders.refetch} />;

  const term = filter.trim().toLowerCase();
  const list = orders.data.content.filter(
    (o) => !term || String(o.id).includes(term.replace('#', '')) || o.items.some((i) => i.productName.toLowerCase().includes(term)),
  );

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-xl font-bold">Order history</h2>
          <p className="text-xs text-slate-500">{orders.data.totalElements} {orders.data.totalElements === 1 ? 'order' : 'orders'} placed</p>
        </div>
        <div className="w-full sm:w-64"><Input icon={Search} placeholder="Filter by order ID or item…" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
      </div>

      {orders.data.totalElements === 0 ? (
        <div className="card">
          <EmptyState icon={Package} title="No orders yet" description="When you place an order it will show up here so you can track it.">
            <Link to="/"><Button>Start shopping</Button></Link>
          </EmptyState>
        </div>
      ) : list.length === 0 ? (
        <div className="card"><EmptyState title="No matching orders" description="Nothing on this page matches your filter." /></div>
      ) : (
        list.map((order) => {
          const vendors = new Set(order.items.map((i) => i.storeName)).size;
          return (
            <article key={order.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                  <span className="font-bold">Order #{order.id}</span>
                  <span className="text-slate-500">{formatDate(order.createdAt)}</span>
                  <span className="text-slate-500">{vendors} {vendors === 1 ? 'vendor' : 'vendors'}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <ul className="min-w-0 flex-1 space-y-1 text-sm">
                  {order.items.slice(0, 3).map((i, idx) => (
                    <li key={idx} className="flex gap-2"><span className="text-slate-400">{i.quantity}×</span><span className="truncate font-semibold">{i.productName}</span><span className="hidden text-xs text-slate-400 sm:inline">· {i.storeName}</span></li>
                  ))}
                  {order.items.length > 3 && <li className="text-xs text-slate-400">+ {order.items.length - 3} more</li>}
                </ul>
                <div className="text-right">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Total</p>
                  <p className="text-xl font-extrabold">{money(order.totalAmount)}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-5 py-3">
                {order.status !== 'CANCELLED' && <Button size="sm" variant="secondary" onClick={() => setTracking(order)}>Track order</Button>}
                {order.status === 'SHIPPED' && (
                  <Button size="sm" icon={PackageCheck} loading={arrive.isPending && arrive.variables === order.id} onClick={() => window.confirm('Confirm that you have received this order?') && arrive.mutate(order.id)}>
                    I received it
                  </Button>
                )}
                <Link to={`/account/orders/${order.id}`}><Button size="sm" variant={order.status === 'PENDING' ? 'secondary' : 'primary'}>View receipt</Button></Link>
                {order.status === 'PENDING' && <Link to={`/account/orders/${order.id}`}><Button size="sm">Pay now</Button></Link>}
              </div>
            </article>
          );
        })
      )}

      <Pagination page={page} totalPages={orders.data.totalPages} onChange={setPage} />
      <TrackModal order={tracking} onClose={() => setTracking(null)} />
    </div>
  );
}
