import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, money } from '../../lib/format';
import { Button, EmptyState, ErrorState, Modal, PageHeader, PageLoader, StatusBadge } from '../../components/ui';
import StoreGate from './StoreGate';

const TABS = ['ALL', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PENDING', 'CANCELLED'];
const TAB_LABEL = { ALL: 'All', PAID: 'Paid · to process', PROCESSING: 'Processing', SHIPPED: 'Shipped · awaiting arrival', DELIVERED: 'Delivered', PENDING: 'Awaiting payment', CANCELLED: 'Cancelled' };

// Mirrors the backend: vendors ship the order, the CUSTOMER confirms arrival (DELIVERED)
const NEXT = {
  PENDING: ['CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: [],
  DELIVERED: [],
  CANCELLED: [],
};
const ACTION_LABEL = { PROCESSING: 'Start processing', SHIPPED: 'Mark as shipped', CANCELLED: 'Cancel order' };

export default function Orders() {
  return <StoreGate>{() => <OrdersTable />}</StoreGate>;
}

function OrdersTable() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('ALL');
  const [selected, setSelected] = useState(null);

  const orders = useQuery({ queryKey: ['vendor-orders'], queryFn: () => api('/api/orders', { params: { size: 100 } }) });

  const update = useMutation({
    mutationFn: ({ id, status }) => api(`/api/orders/${id}/status`, { method: 'PUT', body: { status } }),
    onSuccess: (updated) => {
      toast.success(`Order #${updated.id} is now ${updated.status}`);
      setSelected(updated);
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (orders.isPending) return <PageLoader />;
  if (orders.isError) return <ErrorState error={orders.error} onRetry={orders.refetch} />;

  const all = orders.data.content;
  const count = (status) => (status === 'ALL' ? all.length : all.filter((o) => o.status === status).length);
  const list = tab === 'ALL' ? all : all.filter((o) => o.status === tab);

  const primaryAction = (order) => NEXT[order.status].find((s) => s !== 'CANCELLED');

  return (
    <>
      <PageHeader eyebrow="Fulfilment" title="Store orders" description="Orders containing your products. Totals show your share of each order." />

      <div className="card overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-3">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-3 pb-3 text-sm font-semibold transition-colors ${tab === t ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {TAB_LABEL[t]} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">{count(t)}</span>
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders here" description="Orders will show up in this list as customers buy and pay." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Items</th><th className="th">Your total</th><th className="th">Status</th><th className="th text-right">Fulfilment</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((o) => {
                  const next = primaryAction(o);
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60">
                      <td className="td"><span className="font-mono font-semibold">#{o.id}</span><p className="text-xs text-slate-400">{formatDateTime(o.createdAt)}</p></td>
                      <td className="td font-semibold">{o.customerName}</td>
                      <td className="td text-xs">{o.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}</td>
                      <td className="td font-bold">{money(o.totalAmount)}</td>
                      <td className="td"><StatusBadge status={o.status} /></td>
                      <td className="td">
                        <div className="flex justify-end gap-2">
                          {o.status === 'SHIPPED' && <span className="self-center text-xs font-semibold text-violet-600">Awaiting customer</span>}
                          {o.status === 'DELIVERED' && <span className="self-center text-xs font-semibold text-emerald-600">Arrival confirmed</span>}
                          {next && <Button size="sm" variant="soft" loading={update.isPending && update.variables?.id === o.id} onClick={() => update.mutate({ id: o.id, status: next })}>{ACTION_LABEL[next]}</Button>}
                          <Button size="sm" variant="secondary" onClick={() => setSelected(o)}>View</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400">Showing your latest {all.length} orders.</p>
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Order #${selected.id}` : ''}
        subtitle={selected ? `Placed ${formatDateTime(selected.createdAt)} by ${selected.customerName}` : ''}
        footer={
          selected && (
            <>
              {NEXT[selected.status].map((s) => (
                <Button key={s} variant={s === 'CANCELLED' ? 'danger' : 'primary'} loading={update.isPending && update.variables?.status === s} onClick={() => (s !== 'CANCELLED' || window.confirm('Cancel this order? Stock will be restored.')) && update.mutate({ id: selected.id, status: s })}>
                  {ACTION_LABEL[s]}
                </Button>
              ))}
              {NEXT[selected.status].length === 0 && <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>}
            </>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Status</span><StatusBadge status={selected.status} /></div>
            {selected.status === 'SHIPPED' && <p className="rounded-xl bg-violet-50 p-3 text-sm text-violet-700">Shipped. Waiting for the customer to confirm that the order arrived. You will be notified.</p>}
            {selected.status === 'DELIVERED' && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">The customer confirmed that this order arrived.</p>}
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {selected.items.map((i, idx) => (
                <li key={idx} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div><p className="font-bold">{i.productName}</p><p className="text-xs text-slate-500">{i.quantity} × {money(i.unitPrice)}</p></div>
                  <p className="font-bold">{money(i.lineTotal)}</p>
                </li>
              ))}
              <li className="flex justify-between bg-slate-50 px-4 py-3 text-sm font-extrabold"><span>Your total</span><span>{money(selected.totalAmount)}</span></li>
            </ul>
            <div>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-bold"><MapPin className="h-4 w-4 text-brand-600" /> Ship to</p>
              <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{selected.shippingAddress}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
