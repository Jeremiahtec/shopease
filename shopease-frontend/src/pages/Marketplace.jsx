import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowRight, SlidersHorizontal, Search as SearchIcon } from 'lucide-react';
import { api } from '../lib/api';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { Button, EmptyState, ErrorState, Input, Pagination, Select } from '../components/ui';

const SORTS = {
  newest: { sortBy: 'createdAt', direction: 'desc', label: 'Newest first' },
  'price-asc': { sortBy: 'price', direction: 'asc', label: 'Price: low to high' },
  'price-desc': { sortBy: 'price', direction: 'desc', label: 'Price: high to low' },
  name: { sortBy: 'name', direction: 'asc', label: 'Name: A–Z' },
};

export default function Marketplace() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'newest';
  const page = Number(params.get('page') || 0);

  const [minInput, setMinInput] = useState(min);
  const [maxInput, setMaxInput] = useState(max);
  useEffect(() => {
    setMinInput(min);
    setMaxInput(max);
  }, [min, max]);

  const update = (patch, keepPage = false) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value === '' || value == null ? next.delete(key) : next.set(key, value)));
    if (!keepPage) next.delete('page');
    setParams(next);
  };

  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api('/api/categories', { params: { size: 100 } }) });
  const products = useQuery({
    queryKey: ['products', { q, category, min, max, sort, page }],
    queryFn: () =>
      api('/api/products/search', {
        params: {
          keyword: q,
          categoryId: category,
          minPrice: min,
          maxPrice: max,
          sortBy: SORTS[sort].sortBy,
          direction: SORTS[sort].direction,
          page,
          size: 12,
        },
      }),
    placeholderData: keepPreviousData,
  });

  const cats = categories.data?.content ?? [];
  const activeFilters = Boolean(q || category || min || max);

  return (
    <>
      <section className="animate-fade-in bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:py-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-300" /> Multi-vendor marketplace
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              Curated products,
              <br /> direct from independent makers
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
              Shop several vendors in one cart, pay once with Paystack, and track every order from your account.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#products" className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-brand-700 hover:bg-brand-50">
                Explore collection <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/register" className="inline-flex h-12 items-center rounded-lg border border-white/30 px-6 text-sm font-bold text-white hover:bg-white/10">
                Sell on ShopEase
              </Link>
            </div>
          </div>
          {cats.length > 0 && (
            <div className="grid grid-cols-3 gap-3 self-end">
              {cats.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => update({ category: c.id })}
                  className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur transition hover:bg-white/20"
                >
                  <p className="line-clamp-2 text-sm font-bold">{c.name}</p>
                  <p className="mt-1 text-[11px] text-white/70">Browse →</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div id="products" className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit space-y-6 p-5 lg:sticky lg:top-20">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold"><SlidersHorizontal className="h-4 w-4 text-brand-600" /> Filters</h2>
            {activeFilters && (
              <button onClick={() => setParams(new URLSearchParams())} className="text-xs font-semibold text-brand-600 hover:underline">
                Reset all
              </button>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold">Categories</h3>
            <ul className="space-y-0.5 text-sm">
              <li>
                <button onClick={() => update({ category: '' })} className={`w-full rounded-lg px-3 py-2 text-left font-semibold ${!category ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  All products
                </button>
              </li>
              {cats.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => update({ category: c.id })}
                    className={`w-full rounded-lg px-3 py-2 text-left ${String(c.id) === category ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
              {categories.isSuccess && cats.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">No categories yet</li>}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-bold">Price range</h3>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" placeholder="Min" value={minInput} onChange={(e) => setMinInput(e.target.value)} />
              <span className="text-slate-400">–</span>
              <Input type="number" min="0" placeholder="Max" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} />
            </div>
            <Button size="sm" variant="soft" className="mt-2 w-full" onClick={() => update({ min: minInput, max: maxInput })}>
              Apply
            </Button>
          </div>
        </aside>

        <section>
          <div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold">{q ? `Results for “${q}”` : 'Marketplace products'}</h2>
              {products.data && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {products.data.totalElements} {products.data.totalElements === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-500">
              Sort by
              <Select value={sort} onChange={(e) => update({ sort: e.target.value })} className="h-9 w-auto font-semibold text-slate-800">
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>{s.label}</option>
                ))}
              </Select>
            </label>
          </div>

          {products.isError ? (
            <ErrorState error={products.error} onRetry={products.refetch} />
          ) : products.isPending ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.data.content.length === 0 ? (
            <div className="card">
              <EmptyState icon={SearchIcon} title="No products found" description={activeFilters ? 'Try removing some filters or searching for something else.' : 'No vendor has listed a product yet. Check back soon!'}>
                {activeFilters && <Button variant="secondary" onClick={() => setParams(new URLSearchParams())}>Clear filters</Button>}
              </EmptyState>
            </div>
          ) : (
            <>
              <div className={`stagger grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${products.isFetching ? 'opacity-70' : ''}`}>
                {products.data.content.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing {page * products.data.size + 1}–{page * products.data.size + products.data.content.length} of {products.data.totalElements}
                </p>
                <Pagination page={page} totalPages={products.data.totalPages} onChange={(p) => update({ page: p }, true)} />
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
