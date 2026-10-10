import { useQuery } from '@tanstack/react-query';
import { Store } from 'lucide-react';
import { api } from '../../lib/api';
import { ErrorState, PageHeader, PageLoader } from '../../components/ui';
import StoreForm from './StoreForm';

/** Vendor pages need a store. If there is none yet, show the "create your store" step instead. */
export default function StoreGate({ children }) {
  const store = useQuery({ queryKey: ['my-store'], queryFn: () => api('/api/stores/me'), retry: false });

  if (store.isPending) return <PageLoader />;
  if (store.isError && store.error.status !== 404) return <ErrorState error={store.error} onRetry={store.refetch} />;
  if (store.isError) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Set up your store" description="Create your store to start listing products. You can change all of this later." />
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-700"><Store className="h-5 w-5" /> Step 1 of 2 — create your store, then add your first product.</div>
        <StoreForm />
      </div>
    );
  }
  return children(store.data);
}
