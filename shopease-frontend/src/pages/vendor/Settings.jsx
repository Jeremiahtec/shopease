import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ErrorState, PageHeader, PageLoader } from '../../components/ui';
import StoreForm from './StoreForm';

export default function Settings() {
  const store = useQuery({ queryKey: ['my-store'], queryFn: () => api('/api/stores/me'), retry: false });
  if (store.isPending) return <PageLoader />;
  const missing = store.isError && store.error.status === 404;
  if (store.isError && !missing) return <ErrorState error={store.error} onRetry={store.refetch} />;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Store settings & brand configuration" description="Configure the public identity customers see on your storefront." />
      {store.data && (
        <div className={`mb-6 flex items-center justify-between gap-3 rounded-2xl border p-5 ${store.data.active ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div>
            <p className={`font-bold ${store.data.active ? 'text-emerald-800' : 'text-rose-800'}`}>Store status: {store.data.active ? 'Active & accepting orders' : 'Suspended'}</p>
            <p className="text-sm text-slate-600">{store.data.active ? 'Your products are visible on the marketplace.' : 'Your products are hidden. Contact the platform admin to be reinstated.'}</p>
          </div>
        </div>
      )}
      <StoreForm store={store.data} />
    </div>
  );
}
