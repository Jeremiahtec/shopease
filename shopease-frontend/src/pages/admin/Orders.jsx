import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatDateTime, money } from '../../lib/format';
import { ErrorState, PageHeader, PageLoader, Pagination, StatusBadge } from '../../components/ui';

export default function Orders() {
  const [page, setPage] = useState(0);
  const orders = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => api('/api/admin/orders', { params: { page, size: 10 } }),
    placeholderData: keepPreviousData,
  });

  if (orders.isPending) return <PageLoader />;
  if (orders.isError) return <ErrorState error={orders.error} onRetry={orders.refetch} />;

  return (
    <>
      <PageHeader title="Global orders" description="Every order on the platform. Admins monitor orders; vendors and customers change their status." />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Items</th><th className="th">Total</th><th className="th">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {orders.data.content.map((o) => {
                const vendors = [...new Set(o.items.map((i) => i.storeName))];
                return (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="td"><span className="font-mono font-semibold">#{o.id}</span><p className="text-xs text-slate-400">{formatDateTime(o.createdAt)}</p></td>
                    <td className="td font-semibold">{o.customerName}</td>
                    <td className="td text-xs">{o.items.length} items · {vendors.join(', ')}</td>
                    <td className="td font-bold">{money(o.totalAmount)}</td>
                    <td className="td"><StatusBadge status={o.status} /></td>
                  </tr>
                );
              })}
              {orders.data.content.length === 0 && <tr><td colSpan={5} className="td py-10 text-center text-slate-400">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 p-4"><Pagination page={page} totalPages={orders.data.totalPages} onChange={setPage} /></div>
      </div>
    </>
  );
}
