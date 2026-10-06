import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Heart, LogOut, Package, ShieldCheck, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, initials } from '../lib/format';
import { useUnreadCount } from '../hooks/useNotifications';

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unread = useUnreadCount() ?? 0;

  const orders = useQuery({ queryKey: ['orders', 'count'], queryFn: () => api('/api/orders', { params: { size: 1 } }) });
  const wishlist = useQuery({ queryKey: ['wishlist', 'count'], queryFn: () => api('/api/wishlist', { params: { size: 1 } }) });

  const item = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-xs text-slate-500">Home / Customer portal</p>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Customer Account Center</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-extrabold text-brand-700">
                  {initials(user.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{user.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">Member since {formatDate(user.createdAt, { month: 'short', year: 'numeric', day: undefined })}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-center">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xl font-extrabold text-brand-600">{orders.data?.totalElements ?? '–'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">Total orders</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xl font-extrabold text-emerald-600">{wishlist.data?.totalElements ?? '–'}</p>
                  <p className="text-[11px] font-semibold text-slate-500">Saved wishlist</p>
                </div>
              </div>
            </div>

            <nav className="card space-y-1 p-3">
              <NavLink to="/account/profile" className={item}><User className="h-4 w-4" /> My profile</NavLink>
              <NavLink to="/account/orders" className={item}><Package className="h-4 w-4" /> Order history</NavLink>
              <NavLink to="/account/notifications" className={item}>
                <Bell className="h-4 w-4" /> Notifications
                {unread > 0 && (
                  <span aria-label={`${unread} unread notifications`} className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{unread}</span>
                )}
              </NavLink>
              <NavLink to="/account/wishlist" className={item}><Heart className="h-4 w-4" /> Wishlist</NavLink>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </nav>

            <div className="card flex gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Secure payments</p>
                <p className="text-xs leading-relaxed text-slate-500">Payments are processed by Paystack. We never see or store your card details.</p>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
