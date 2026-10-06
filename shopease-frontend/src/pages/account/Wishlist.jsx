import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { Button, EmptyState, ErrorState, PageLoader, Pagination } from '../../components/ui';

export default function Wishlist() {
  const [page, setPage] = useState(0);
  const list = useQuery({
    queryKey: ['wishlist', 'page', page],
    queryFn: () => api('/api/wishlist', { params: { page, size: 6 } }),
    placeholderData: keepPreviousData,
  });

  if (list.isPending) return <PageLoader />;
  if (list.isError) return <ErrorState error={list.error} onRetry={list.refetch} />;

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-xl font-bold">Wishlist</h2>
        <p className="text-xs text-slate-500">{list.data.totalElements} saved {list.data.totalElements === 1 ? 'item' : 'items'}</p>
      </div>
      {list.data.content.length === 0 ? (
        <div className="card">
          <EmptyState icon={Heart} title="Nothing saved yet" description="Tap the heart on any product to save it for later.">
            <Link to="/"><Button>Browse the marketplace</Button></Link>
          </EmptyState>
        </div>
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.data.content.map((entry) => <ProductCard key={entry.id} product={entry.product} />)}
        </div>
      )}
      <Pagination page={page} totalPages={list.data.totalPages} onChange={setPage} />
    </div>
  );
}
