import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { money } from '../../lib/format';
import { Button, EmptyState, ErrorState, Input, PageHeader, PageLoader, Pagination, StatusBadge, Thumb } from '../../components/ui';
import StoreGate from './StoreGate';
import ProductFormModal from './ProductFormModal';

export default function Products() {
  return <StoreGate>{() => <ProductsTable />}</StoreGate>;
}

function stockBadge(qty) {
  if (qty <= 0) return <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">0 · Depleted</span>;
  if (qty <= 5) return <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{qty} · Low stock</span>;
  return <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{qty} · Healthy</span>;
}

function ProductsTable() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const products = useQuery({
    queryKey: ['vendor-products', page],
    queryFn: () => api('/api/products/mine', { params: { page, size: 10 } }),
    placeholderData: keepPreviousData,
  });

  const archive = useMutation({
    mutationFn: (id) => api(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Product removed');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const openForm = (product = null) => {
    setEditing(product);
    setOpen(true);
  };

  if (products.isPending) return <PageLoader />;
  if (products.isError) return <ErrorState error={products.error} onRetry={products.refetch} />;

  const term = filter.trim().toLowerCase();
  const list = products.data.content.filter((p) => !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));

  return (
    <>
      <PageHeader title="Products" description="Manage pricing, stock levels and visibility." actions={<Button icon={Plus} onClick={() => openForm()}>New product</Button>} />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <p className="text-sm font-semibold text-slate-600">{products.data.totalElements} products</p>
          <div className="w-full sm:w-72"><Input icon={Search} placeholder="Filter by name or SKU…" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
        </div>

        {products.data.totalElements === 0 ? (
          <EmptyState title="No products yet" description="Add your first product to start selling.">
            <Button icon={Plus} onClick={() => openForm()}>Add product</Button>
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr><th className="th">Product</th><th className="th">SKU</th><th className="th">Price</th><th className="th">Stock</th><th className="th">Status</th><th className="th text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <Thumb src={p.imageUrls?.[0]} alt="" className="h-12 w-12 shrink-0 rounded-lg" />
                        <div className="min-w-0"><p className="line-clamp-1 font-bold text-slate-900">{p.name}</p><p className="text-xs text-slate-400">{p.categoryName}</p></div>
                      </div>
                    </td>
                    <td className="td font-mono text-xs">{p.sku}</td>
                    <td className="td font-bold">{money(p.price)}</td>
                    <td className="td">{stockBadge(p.stockQuantity)}</td>
                    <td className="td"><StatusBadge status={p.status} /></td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openForm(p)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => window.confirm(`Remove “${p.name}”? Past orders are kept.`) && archive.mutate(p.id)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={6} className="td py-10 text-center text-slate-400">No products on this page match your filter.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 p-4"><Pagination page={page} totalPages={products.data.totalPages} onChange={setPage} /></div>
      </div>

      <ProductFormModal open={open} product={editing} onClose={() => setOpen(false)} />
    </>
  );
}
