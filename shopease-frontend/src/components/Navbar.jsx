import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, Heart, LayoutDashboard, LogOut, Package, Search, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../hooks/useCart';
import { initials, money, roleHome } from '../lib/format';
import { Logo } from './ui';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const [term, setTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartNote, setCartNote] = useState(null);
  const menuRef = useRef(null);
  const isCustomerOrGuest = !user || user.role === 'CUSTOMER';

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // quiet confirmation whenever something is added to the cart
  useEffect(() => {
    let timer;
    const onAdded = (e) => {
      setCartNote({ ...e.detail, id: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setCartNote(null), 2800);
    };
    window.addEventListener('shopease:cart-added', onAdded);
    return () => {
      window.removeEventListener('shopease:cart-added', onAdded);
      clearTimeout(timer);
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const menuItem = 'flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <Logo className="h-7 sm:h-8" />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900')}>
            Marketplace
          </NavLink>
          <Link to="/legal/help" className="text-slate-600 hover:text-slate-900">Help Center</Link>
        </nav>

        <form onSubmit={submit} className="mx-auto hidden max-w-md flex-1 sm:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {isCustomerOrGuest && (
            <div className="relative">
            <Link to="/cart" className="relative flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
              <ShoppingBag key={cartNote?.id ?? 'idle'} className={`h-4 w-4 ${cartNote ? 'animate-cart-bounce' : ''}`} />
              <span className="hidden sm:inline">{money(cart?.totalAmount ?? 0)}</span>
              {cart?.totalItems > 0 && (
                <span key={cart.totalItems} className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                  {cart.totalItems}
                </span>
              )}
            </Link>
            {cartNote && (
              <Link
                key={cartNote.id}
                to="/cart"
                className="absolute right-0 top-full z-50 mt-2 flex w-60 animate-scale-in origin-top-right items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-pop"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-3.5 w-3.5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-slate-900">Added to cart</span>
                  <span className="block truncate text-slate-500">{cartNote.name}</span>
                </span>
                <span className="font-bold text-brand-600">View</span>
              </Link>
            )}
            </div>
          )}

          {user?.role === 'CUSTOMER' && <NotificationBell viewAllPath="/account/notifications" />}

          {!user ? (
            <>
              <Link to="/login" className="hidden px-3 text-sm font-semibold text-slate-700 hover:text-brand-700 sm:block">Sign in</Link>
              <Link to="/register" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">
                Create account
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-100">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {initials(user.fullName)}
                </span>
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block text-sm font-bold text-slate-900">{user.fullName}</span>
                  <span className="block text-[11px] capitalize text-slate-500">{user.role.toLowerCase()}</span>
                </span>
                <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right animate-scale-in overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop">
                  {user.role === 'CUSTOMER' ? (
                    <>
                      <Link className={menuItem} to="/account/orders" onClick={() => setMenuOpen(false)}><Package className="h-4 w-4" /> My orders</Link>
                      <Link className={menuItem} to="/account/wishlist" onClick={() => setMenuOpen(false)}><Heart className="h-4 w-4" /> Wishlist</Link>
                      <Link className={menuItem} to="/account/profile" onClick={() => setMenuOpen(false)}><UserIcon className="h-4 w-4" /> My profile</Link>
                    </>
                  ) : (
                    <Link className={menuItem} to={roleHome(user.role)} onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Go to {user.role === 'VENDOR' ? 'vendor hub' : 'admin console'}
                    </Link>
                  )}
                  <button onClick={handleLogout} className={`${menuItem} w-full border-t border-slate-100 text-rose-600`}>
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-slate-100 px-4 py-2 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products…" className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:outline-none" />
        </div>
      </form>
    </header>
  );
}
