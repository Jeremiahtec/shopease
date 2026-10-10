import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, ShoppingBag, Store, Users, Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, money } from '../../lib/format';
import { Badge, Button, ErrorState, PageHeader, PageLoader, Pagination, StatCard } from '../../components/ui';

export default function Overview() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const stats = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => api('/api/admin/dashboard') });
  const stores = useQuery({
    queryKey: ['admin', 'stores', page],
    queryFn: () => api('/api/admin/stores', { params: { page, size: 8 } }),
    placeholderData: keepPreviousData,
  });

  const toggle = useMutation({
    mutationFn: ({ ownerId, suspend }) => api(`/api/admin/vendors/${ownerId}/${suspend ? 'suspend' : 'activate'}`, { method: 'PUT' }),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (stats.isPending || stores.isPending) return <PageLoader />;
  if (stats.isError) return <ErrorState error={stats.error} onRetry={stats.refetch} />;
  const s = stats.data;

  return (
    <>
      <PageHeader title="Platform overview & governance" description="Marketplace totals, vendor stores and moderation in one place." />

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Registered users" value={s.totalUsers} hint={`${s.totalCustomers} shoppers · ${s.totalVendors} vendors`} icon={Users} />
        <StatCard label="Marketplace stores" value={s.totalStores} icon={Store} />
        <StatCard label="Active products" value={s.totalProducts} hint={`${s.totalOrders} orders placed`} icon={Package} tone="amber" />
        <StatCard label="Total revenue (paid)" value={money(s.totalRevenue)} hint="Sum of successful Paystack payments" icon={Wallet} tone="green" />
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 font-bold"><ShoppingBag className="h-4 w-4 text-brand-600" /> Stores</h2>
          <span className="text-xs text-slate-500">{stores.data?.totalElements ?? 0} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50"><tr><th className="th">Store</th><th className="th">Owner id</th><th className="th">Created</th><th className="th">Status</th><th className="th text-right">Governance</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {stores.data.content.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/60">
                  <td className="td"><p className="font-bold text-slate-900">{st.name}</p><p className="font-mono text-[11px] text-slate-400">STR-{st.id}</p></td>
                  <td className="td font-mono text-xs">#{st.ownerId}</td>
                  <td className="td">{formatDate(st.createdAt)}</td>
                  <td className="td"><Badge tone={st.active ? 'green' : 'red'}>{st.active ? 'ACTIVE' : 'SUSPENDED'}</Badge></td>
                  <td className="td text-right">
                    <Button size="sm" variant={st.active ? 'danger' : 'soft'} loading={toggle.isPending && toggle.variables?.ownerId === st.ownerId} onClick={() => toggle.mutate({ ownerId: st.ownerId, suspend: st.active })}>
                      {st.active ? 'Suspend' : 'Reinstate'}
                    </Button>
                  </td>
                </tr>
              ))}
              {stores.data.content.length === 0 && <tr><td colSpan={5} className="td py-10 text-center text-slate-400">No vendor has created a store yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 p-4"><Pagination page={page} totalPages={stores.data.totalPages} onChange={setPage} /></div>
      </section>
    </>
  );
}
