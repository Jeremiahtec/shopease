import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { notificationTarget, useNotificationActions } from '../hooks/useNotifications';
import { timeAgo } from '../lib/format';
import { NotificationIcon } from '../components/NotificationBell';
import { Button, EmptyState, ErrorState, PageLoader, Pagination } from '../components/ui';

/** Full notification list. Used on the customer profile area and in the vendor hub. */
export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { markRead, markAll } = useNotificationActions();

  const list = useQuery({
    queryKey: ['notifications', 'list', page],
    queryFn: () => api('/api/notifications', { params: { page, size: 10 } }),
    placeholderData: keepPreviousData,
  });

  if (list.isPending) return <PageLoader />;
  if (list.isError) return <ErrorState error={list.error} onRetry={list.refetch} />;

  const unread = list.data.content.filter((n) => !n.seen).length;

  const open = (n) => {
    if (!n.seen) markRead.mutate(n.id);
    navigate(notificationTarget(user.role, n));
  };

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-xl font-bold">Notifications</h2>
          <p className="text-xs text-slate-500">
            {list.data.totalElements === 0 ? 'Nothing yet' : `${list.data.totalElements} total`}
            {unread > 0 && ` · ${unread} unread on this page`}
          </p>
        </div>
        <Button variant="secondary" icon={CheckCheck} loading={markAll.isPending} onClick={() => markAll.mutate()}>
          Mark all as read
        </Button>
      </div>

      {list.data.content.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="You're all caught up" description={user.role === 'VENDOR' ? 'New paid orders and delivery confirmations will show up here.' : 'Payment, shipping and arrival updates for your orders will show up here.'} />
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {list.data.content.map((n) => (
            <button key={n.id} onClick={() => open(n)} className={`flex w-full gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50 ${n.seen ? '' : 'bg-brand-50/40'}`}>
              <NotificationIcon status={n.status} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{n.title}</span>
                  {!n.seen && <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">New</span>}
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">{n.message}</span>
                <span className="mt-1 block text-xs text-slate-400">{timeAgo(n.createdAt)}{n.orderId ? ` · Order #${n.orderId}` : ''}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={list.data.totalPages} onChange={setPage} />
    </div>
  );
}
