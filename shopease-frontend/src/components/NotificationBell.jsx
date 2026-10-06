import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCheck, CheckCircle2, Cog, PackageCheck, Truck, Wallet, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { notificationTarget, useNotificationActions, useUnreadCount } from '../hooks/useNotifications';
import { timeAgo } from '../lib/format';

const ICONS = { PAID: Wallet, PROCESSING: Cog, SHIPPED: Truck, DELIVERED: PackageCheck, CANCELLED: XCircle };
const TONES = {
  PAID: 'bg-sky-50 text-sky-600',
  PROCESSING: 'bg-brand-50 text-brand-600',
  SHIPPED: 'bg-violet-50 text-violet-600',
  DELIVERED: 'bg-emerald-50 text-emerald-600',
  CANCELLED: 'bg-rose-50 text-rose-600',
};

export function NotificationIcon({ status }) {
  const Icon = ICONS[status] ?? CheckCircle2;
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TONES[status] ?? 'bg-slate-100 text-slate-500'}`}>
      <Icon className="h-4 w-4" />
    </span>
  );
}

/** Bell with a red unread badge and a dropdown of the latest notifications. */
export default function NotificationBell({ viewAllPath }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const unread = useUnreadCount();
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const previous = useRef(null);
  const { markRead, markAll } = useNotificationActions();

  const latest = useQuery({
    queryKey: ['notifications', 'list', 'bell'],
    queryFn: () => api('/api/notifications', { params: { size: 8 } }),
    enabled: open,
  });

  // a quiet toast when something new arrives while the user is on the site
  useEffect(() => {
    if (unread === undefined) return;
    if (previous.current !== null && unread > previous.current) {
      const fresh = unread - previous.current;
      toast.success(fresh === 1 ? 'You have a new notification' : `You have ${fresh} new notifications`);
    }
    previous.current = unread;
  }, [unread, toast]);

  useEffect(() => {
    const close = (e) => wrapper.current && !wrapper.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const count = unread ?? 0;
  const items = latest.data?.content ?? [];

  const openItem = (n) => {
    if (!n.seen) markRead.mutate(n.id);
    setOpen(false);
    navigate(notificationTarget(user.role, n));
  };

  return (
    <div className="relative" ref={wrapper}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span key={count} className="absolute right-1 top-1 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,380px)] origin-top-right animate-scale-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-bold">Notifications</p>
            <button
              disabled={count === 0 || markAll.isPending}
              onClick={() => markAll.mutate()}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline disabled:text-slate-300 disabled:no-underline"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {latest.isPending ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">You're all caught up. Order updates will show up here.</p>
            ) : (
              items.map((n) => (
                <button key={n.id} onClick={() => openItem(n)} className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${n.seen ? '' : 'bg-brand-50/40'}`}>
                  <NotificationIcon status={n.status} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold text-slate-900">{n.title}</span>
                      {!n.seen && <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" aria-label="unread" />}
                    </span>
                    <span className="line-clamp-2 text-xs text-slate-500">{n.message}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <Link to={viewAllPath} onClick={() => setOpen(false)} className="block bg-slate-50 px-4 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-slate-100">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
