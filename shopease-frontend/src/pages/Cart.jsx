import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Heart, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart, useCartActions } from '../hooks/useCart';
import { money } from '../lib/format';
import { Button, EmptyState, ErrorState, PageLoader, Thumb } from '../components/ui';

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cart = useCart();
  const { update, remove } = useCartActions();
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api('/api/categories', { params: { size: 100 } }) });

  if (user && user.role !== 'CUSTOMER') {
    return <EmptyState title="Carts are for customers" description="Vendor and admin accounts can't place orders. Use a customer account to shop." />;
  }
  if (cart.isPending) return <PageLoader />;
  if (cart.isError) return <ErrorState error={cart.error} onRetry={cart.refetch} />;

  const items = cart.data.items;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <div className="card px-6 py-12">
          <EmptyState icon={ShoppingCart} title="Your cart feels a bit light" description="Explore top-rated products and trending vendor items to fill it up.">
            <Link to="/"><Button size="lg" icon={ArrowRight}>Continue shopping</Button></Link>
            {user ? (
              <Link to="/account/wishlist"><Button size="lg" variant="secondary" icon={Heart}>View saved items</Button></Link>
            ) : (
              <Link to="/login"><Button size="lg" variant="secondary">Sign in</Button></Link>
            )}
          </EmptyState>
          {categories.data?.content?.length > 0 && (
            <div className="mx-auto mt-6 max-w-xl border-t border-slate-100 pt-6">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Explore popular categories</p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.data.content.slice(0, 6).map((c) => (
                  <Link key={c.id} to={`/?category=${c.id}`} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-200 hover:text-brand-700">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const vendors = new Set(items.map((i) => i.storeName)).size;
  const busy = update.isPending || remove.isPending;

  const checkout = () => (user ? navigate('/checkout') : navigate('/login?redirect=/checkout'));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold">Shopping cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-5">
              <Link to={`/products/${item.productId}`}>
                <Thumb src={item.imageUrl} alt={item.productName} className="h-24 w-24 rounded-xl" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/products/${item.productId}`} className="line-clamp-2 font-bold hover:text-brand-700">{item.productName}</Link>
                    <p className="text-xs text-slate-500">Sold by {item.storeName}</p>
                  </div>
                  <p className="font-extrabold">{money(item.lineTotal)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex h-9 items-center rounded-lg border border-slate-200">
                    <button disabled={busy || item.quantity <= 1} onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity - 1 })} className="px-2.5 text-slate-500 hover:text-slate-900 disabled:opacity-40" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button disabled={busy || item.quantity >= item.availableStock} onClick={() => update.mutate({ itemId: item.id, quantity: item.quantity + 1 })} className="px-2.5 text-slate-500 hover:text-slate-900 disabled:opacity-40" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500">{money(item.unitPrice)} each</span>
                    <button onClick={() => remove.mutate(item.id)} className="flex items-center gap-1 font-semibold text-rose-600 hover:underline"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
                  </div>
                </div>
                {item.quantity >= item.availableStock && <p className="mt-1 text-[11px] text-amber-600">Maximum available stock reached</p>}
              </div>
            </div>
          ))}
        </div>

        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <p className="text-xs text-slate-500">{cart.data.totalItems} items from {vendors} {vendors === 1 ? 'vendor' : 'vendors'}</p>
          <dl className="space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{money(cart.data.totalAmount)}</dd></div>
          </dl>
          <div className="flex items-end justify-between border-t border-slate-100 pt-4">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-extrabold text-brand-600">{money(cart.data.totalAmount)}</span>
          </div>
          <Button size="lg" className="w-full" icon={ArrowRight} onClick={checkout}>Proceed to checkout</Button>
          {!user && <p className="rounded-lg bg-brand-50 p-3 text-xs text-brand-700">Browsing as a guest? Your cart is saved and will merge into your account when you sign in.</p>}
          <Link to="/" className="block text-center text-sm font-semibold text-slate-500 hover:text-brand-700">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
