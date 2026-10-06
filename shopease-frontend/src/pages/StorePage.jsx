import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BadgeCheck, Search, Store as StoreIcon } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { EmptyState, ErrorState, Input, PageLoader, Pagination, Select } from '../components/ui';

const SORTS = {
  newest: { sortBy: 'createdAt', direction: 'desc', label: 'Newest first' },
  'price-asc': { sortBy: 'price', direction: 'asc', label: 'Price: low to high' },
  'price-desc': { sortBy: 'price', direction: 'desc', label: 'Price: high to low' },
};

export default function StorePage() {
  const { id } = useParams();
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);

  const store = useQuery({ queryKey: ['store', id], queryFn: () => api(`/api/stores/${id}`), retry: false });
  const products = useQuery({
    queryKey: ['store-products', id, keyword, sort, page],
    queryFn: () =>
      api('/api/products/search', {
        params: { storeId: id, keyword, sortBy: SORTS[sort].sortBy, direction: SORTS[sort].direction, page, size: 9 },
      }),
    enabled: store.isSuccess,
    placeholderData: keepPreviousData,
  });

  if (store.isPending) return <PageLoader />;
  if (store.isError) {
    return store.error.status === 404 ? (
      <EmptyState icon={StoreIcon} title="Store not found"><Link to="/" className="text-sm font-semibold text-brand-600">← Back to marketplace</Link></EmptyState>
    ) : (
      <ErrorState error={store.error} onRetry={store.refetch} />
    );
  }
  const s = store.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="card overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-500 sm:h-52" />
        <div className="relative px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-card">
              {s.logoUrl ? <img src={s.logoUrl} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <StoreIcon className="h-10 w-10 text-brand-600" />}
            </div>
            <div className="min-w-0 flex-1 pt-14 sm:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold">{s.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700"><BadgeCheck className="h-3.5 w-3.5" /> Verified seller</span>
                {!s.active && <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">Suspended</span>}
              </div>
              <p className="mt-1 text-xs text-slate-500">On ShopEase since {formatDate(s.createdAt, { day: undefined })}</p>
            </div>
          </div>
          {s.description && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">{s.description}</p>}
        </div>
      </div>

      <div className="card mt-6 flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <Input icon={Search} placeholder={`Search in ${s.name}…`} value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(0); }} />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          Sort by
          <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }} className="h-10 w-auto font-semibold text-slate-800">
            {Object.entries(SORTS).map(([key, v]) => <option key={key} value={key}>{v.label}</option>)}
          </Select>
        </label>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold">Store products {products.data && <span className="text-sm font-medium text-slate-400">({products.data.totalElements})</span>}</h2>
      {products.isError ? (
        <ErrorState error={products.error} onRetry={products.refetch} />
      ) : products.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
      ) : products.data.content.length === 0 ? (
        <div className="card"><EmptyState title="No products here yet" description="This store has no products matching your search." /></div>
      ) : (
        <>
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.data.content.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          <div className="mt-8"><Pagination page={page} totalPages={products.data.totalPages} onChange={setPage} /></div>
        </>
      )}
    </div>
  );
}
