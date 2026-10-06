import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, CreditCard, MapPin, PackageCheck, Printer, Store } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, money } from '../../lib/format';
import OrderTimeline from '../../components/OrderTimeline';
import { Button, ErrorState, PageLoader, StatusBadge } from '../../components/ui';

export default function OrderDetail() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const order = useQuery({ queryKey: ['order', id], queryFn: () => api(`/api/orders/${id}`), retry: false });

  const pay = useMutation({
    mutationFn: () => api('/api/payments/initialize', { method: 'POST', body: { orderId: Number(id) } }),
    onSuccess: (payment) => window.location.assign(payment.authorizationUrl),
    onError: (e) => toast.error(e.message),
  });

  const cancel = useMutation({
    mutationFn: () => api(`/api/orders/${id}/status`, { method: 'PUT', body: { status: 'CANCELLED' } }),
    onSuccess: () => {
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const arrive = useMutation({
    mutationFn: () => api(`/api/orders/${id}/status`, { method: 'PUT', body: { status: 'DELIVERED' } }),
    onSuccess: () => {
      toast.success('Thanks for confirming! Your order is marked as delivered.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (order.isPending) return <PageLoader />;
  if (order.isError) {
    return <ErrorState error={order.error} onRetry={() => (order.error.status === 404 || order.error.status === 403 ? navigate('/account/orders') : order.refetch())} />;
  }

  const o = order.data;
  const groups = o.items.reduce((acc, item) => {
    (acc[item.storeName] ||= []).push(item);
    return acc;
  }, {});
  const copy = () => navigator.clipboard?.writeText(String(o.id)).then(() => toast.success('Order number copied'));

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">Receipt</p>
            <h2 className="flex items-center gap-2 text-3xl font-extrabold">
              <span className="text-brand-600">#{o.id}</span>
              <button onClick={copy} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 no-print" aria-label="Copy order number"><Copy className="h-4 w-4" /></button>
            </h2>
            <p className="mt-1 text-sm text-slate-500">Placed on {formatDateTime(o.createdAt)}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={o.status} />
            <div className="no-print flex flex-wrap justify-end gap-2">
              {o.status === 'PENDING' && (
                <>
                  <Button icon={CreditCard} loading={pay.isPending} onClick={() => pay.mutate()}>Pay {money(o.totalAmount)}</Button>
                  <Button variant="danger" loading={cancel.isPending} onClick={() => window.confirm('Cancel this order?') && cancel.mutate()}>Cancel order</Button>
                </>
              )}
              <Button variant="secondary" icon={Printer} onClick={() => window.print()} aria-label="Print">Print</Button>
            </div>
          </div>
        </div>
      </div>

      {o.status === 'SHIPPED' && (
        <div className="no-print flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <div>
            <p className="font-bold text-slate-900">Has your order arrived?</p>
            <p className="text-sm text-slate-600">Confirm once you have received your items. The vendor is told the delivery is complete, and you can then review the products.</p>
          </div>
          <Button icon={PackageCheck} loading={arrive.isPending} onClick={() => window.confirm('Confirm that you have received this order?') && arrive.mutate()}>
            I received my order
          </Button>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {Object.entries(groups).map(([storeName, items]) => (
            <section key={storeName} className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3 text-sm font-bold"><Store className="h-4 w-4 text-brand-600" /> {storeName}</div>
              <ul className="divide-y divide-slate-100">
                {items.map((i, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <Link to={`/products/${i.productId}`} className="line-clamp-1 font-bold hover:text-brand-700">{i.productName}</Link>
                      <p className="text-xs text-slate-500">Qty {i.quantity} × {money(i.unitPrice)}</p>
                    </div>
                    <p className="font-extrabold">{money(i.lineTotal)}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="card p-6">
            <h3 className="mb-5 font-bold">Order progress</h3>
            <OrderTimeline status={o.status} />
          </section>
        </div>

        <div className="space-y-5">
          <section className="card p-6">
            <h3 className="mb-4 font-bold">Financial summary</h3>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Items subtotal</span><span className="font-semibold">{money(o.totalAmount)}</span></div>
            <div className="mt-4 flex items-end justify-between border-t border-dashed border-slate-200 pt-4">
              <span className="font-bold">{o.status === 'PENDING' ? 'Total due' : 'Total'}</span>
              <span className="text-2xl font-extrabold text-brand-600">{money(o.totalAmount)}</span>
            </div>
          </section>

          <section className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-brand-600" /> Delivery information</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{o.shippingAddress}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
