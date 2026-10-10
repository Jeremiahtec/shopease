import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';
import { Logo } from '../components/ui';
import PageTransition from '../components/PageTransition';
import { useVendorAlerts } from '../hooks/useVendorAlerts';
import { useUnreadCount } from '../hooks/useNotifications';
import NotificationBell from '../components/NotificationBell';

/**
 * Shared shell for the vendor hub and the admin console:
 * top bar + sidebar on desktop, scrollable tab row on mobile.
 */
export default function DashboardLayout({ variant, nav, sectionLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isVendor = variant === 'vendor';
  const newOrders = useVendorAlerts(isVendor);
  const unread = useUnreadCount() ?? 0;
  const badgeFor = (to) => (isVendor && to === '/vendor/orders' ? newOrders : isVendor && to === '/vendor/notifications' ? unread : 0);

  // The vendor top bar shows live store status
  const store = useQuery({
    queryKey: ['my-store'],
    queryFn: () => api('/api/stores/me'),
    enabled: isVendor,
    retry: false,
  });

  const link = ({ isActive }) =>
    `flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <div className={`${isVendor ? 'theme-vendor' : ''} min-h-screen bg-slate-50`}>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        <Link to={isVendor ? '/vendor' : '/admin'} className="flex shrink-0 items-center gap-3">
          <Logo className="h-7" />
          <span
            className={`hidden rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide sm:inline ${
              isVendor ? 'bg-brand-100 text-brand-700' : 'bg-slate-900 text-white'
            }`}
          >
            {isVendor ? 'Vendor Hub' : 'Superadmin'}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-3">
          {isVendor && store.data && (
            <span className={`hidden text-xs font-semibold md:inline ${store.data.active ? 'text-emerald-700' : 'text-rose-700'}`}>
              {store.data.active ? 'Store is live' : 'Store suspended'}
            </span>
          )}
          {isVendor && store.data && (
            <Link
              to={`/stores/${store.data.id}`}
              className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 lg:flex"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View public storefront
            </Link>
          )}
          {isVendor && <NotificationBell viewAllPath="/vendor/notifications" />}
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {initials(user.fullName)}
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold text-slate-900">{user.fullName}</span>
              <span className="block text-[11px] text-slate-500">{user.email}</span>
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white p-4 lg:block">
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{sectionLabel}</p>
          <nav className="space-y-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={link}>
                <Icon className="h-4 w-4" /> {label}
                <AlertBadge count={badgeFor(to)} label={to === '/vendor/notifications' ? `${badgeFor(to)} unread notifications` : undefined} />
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={link}>
                <Icon className="h-4 w-4" /> {label}
                <AlertBadge count={badgeFor(to)} label={to === '/vendor/notifications' ? `${badgeFor(to)} unread notifications` : undefined} />
              </NavLink>
            ))}
          </nav>
          <main className="p-4 sm:p-6 lg:p-8">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}

/** Red pulsing counter shown on a nav item when something needs attention. */
function AlertBadge({ count, label }) {
  if (!count) return null;
  return (
    <span aria-label={label ?? `${count} new ${count === 1 ? 'order' : 'orders'} waiting`} className="relative ml-auto flex h-5 min-w-5 items-center justify-center">
      <span className="absolute inset-0 animate-ping rounded-full bg-rose-400/60" />
      <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{count}</span>
    </span>
  );
}
