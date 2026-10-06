import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Hourglass, Package, Plus, ShieldCheck, Wallet } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate, money } from '../../lib/format';
import { Button, PageHeader, PageLoader, StatCard, StatusBadge } from '../../components/ui';
import StoreGate from './StoreGate';

const REVENUE_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function Overview() {
  return <StoreGate>{(store) => <Dashboard store={store} />}</StoreGate>;
}

function Dashboard({ store }) {
  const products = useQuery({ queryKey: ['vendor-products', 'all'], queryFn: () => api('/api/products/mine', { params: { size: 100 } }) });
  const orders = useQuery({ queryKey: ['vendor-orders'], queryFn: () => api('/api/orders', { params: { size: 100 } }) });

  if (products.isPending || orders.isPending) return <PageLoader />;

  const productList = products.data?.content ?? [];
  const orderList = orders.data?.content ?? [];
  const revenue = orderList.filter((o) => REVENUE_STATUSES.includes(o.status)).reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const toFulfil = orderList.filter((o) => o.status === 'PAID').length;
  const lowStock = productList.filter((p) => p.status === 'ACTIVE' && p.stockQuantity <= 5);

  return (
    <>
      <PageHeader
        eyebrow="Catalog management"
        title={`${store.name} dashboard`}
        description="Your products, orders and fulfilment at a glance."
        actions={<Link to="/vendor/products"><Button icon={Plus}>Add product</Button></Link>}
      />

      {!store.active && <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Your store is currently suspended. Customers cannot see or buy your products. Contact the platform admin.</div>}

      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (paid orders)" value={money(revenue)} hint="From your latest 100 orders" icon={Wallet} tone="green" />
        <StatCard label="Products listed" value={products.data?.totalElements ?? 0} hint={`${lowStock.length} low on stock`} icon={Package} />
        <StatCard label="Orders to fulfil" value={toFulfil} hint="Paid and waiting for you" icon={Hourglass} tone="amber" />
        <StatCard label="Store status" value={store.active ? 'Active' : 'Suspended'} hint="Controlled by the platform admin" icon={ShieldCheck} tone={store.active ? 'green' : 'amber'} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="font-bold">Recent orders</h2>
            <Link to="/vendor/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          {orderList.length === 0 ? (
            <p className="px-5 pb-8 pt-2 text-sm text-slate-500">No orders yet. They will appear here once customers buy your products.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50"><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Your total</th><th className="th">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {orderList.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <td className="td"><span className="font-mono font-semibold">#{o.id}</span><p className="text-xs text-slate-400">{formatDate(o.createdAt)}</p></td>
                      <td className="td">{o.customerName}</td>
                      <td className="td font-bold">{money(o.totalAmount)}</td>
                      <td className="td"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-bold">Stock alerts</h2>
          {lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">All active products have healthy stock.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="truncate pr-3 font-semibold">{p.name}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${p.stockQuantity === 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {p.stockQuantity === 0 ? 'Depleted' : `${p.stockQuantity} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
