import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Heart, Minus, Pencil, Plus, ShieldCheck, ShoppingCart, Store, Truck, Zap } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCartActions } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { formatDate, initials, money } from '../lib/format';
import { Button, EmptyState, ErrorState, Field, PageLoader, StarPicker, Stars, Textarea, Thumb } from '../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCartActions();
  const wishlist = useWishlist();

  const product = useQuery({ queryKey: ['product', id], queryFn: () => api(`/api/products/${id}`), retry: false });
  const reviews = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api(`/api/products/${id}/reviews`, { params: { size: 100 } }),
    enabled: product.isSuccess,
  });

  if (product.isPending) return <PageLoader />;
  if (product.isError) {
    return product.error.status === 404 ? (
      <EmptyState title="Product not found" description="It may have been removed or is no longer available.">
        <Link to="/" className="text-sm font-semibold text-brand-600">← Back to marketplace</Link>
      </EmptyState>
    ) : (
      <ErrorState error={product.error} onRetry={product.refetch} />
    );
  }

  const p = product.data;
  const images = p.imageUrls?.length ? p.imageUrls : [null];
  const soldOut = p.stockQuantity <= 0;
  const canShop = !user || user.role === 'CUSTOMER';
  const saved = wishlist.ids.has(p.id);
  const list = reviews.data?.content ?? [];
  const average = list.length ? list.reduce((sum, r) => sum + r.rating, 0) / list.length : 0;

  const addToCart = (goToCart) =>
    add.mutate(
      { productId: p.id, quantity: qty },
      {
        onSuccess: () => {
          if (goToCart) return navigate('/cart');
          setAdded(true);
          return setTimeout(() => setAdded(false), 1800);
        },
      },
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex flex-wrap gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-brand-700">Marketplace</Link> /
        <Link to={`/?category=${p.categoryId}`} className="hover:text-brand-700">{p.categoryName}</Link> /
        <span className="font-semibold text-slate-700">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Thumb src={images[selected]} alt={p.name} className="card aspect-square w-full" />
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setSelected(i)} className={`overflow-hidden rounded-xl border-2 ${i === selected ? 'border-brand-600' : 'border-transparent'}`}>
                  <Thumb src={src} alt="" className="aspect-square w-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link to={`/stores/${p.storeId}`} className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100">
            <Store className="h-3.5 w-3.5" /> {p.storeName}
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">{p.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
            {list.length > 0 ? (
              <>
                <Stars value={average} />
                <span className="font-semibold text-slate-700">{average.toFixed(1)}</span>
                <span>({list.length} {list.length === 1 ? 'review' : 'reviews'})</span>
              </>
            ) : (
              <span>No reviews yet</span>
            )}
            <span className="font-mono text-xs text-slate-400">SKU {p.sku}</span>
          </div>

          <p className="mt-5 text-4xl font-extrabold">{money(p.price)}</p>
          <p className={`mt-2 inline-block rounded px-2.5 py-1 text-xs font-semibold ${soldOut ? 'bg-rose-50 text-rose-700' : p.stockQuantity <= 5 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {soldOut ? 'Sold out' : `In stock · ${p.stockQuantity} available`}
          </p>

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-600">{p.description || 'The vendor has not added a description yet.'}</p>

          {canShop && (
            <div className="mt-8 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 items-center rounded-lg border border-slate-200 bg-white">
                  <button className="px-3 text-slate-500 hover:text-slate-900 disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <span className="w-10 text-center font-bold">{qty}</span>
                  <button className="px-3 text-slate-500 hover:text-slate-900 disabled:opacity-40" disabled={qty >= p.stockQuantity} onClick={() => setQty((q) => q + 1)} aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                <Button size="lg" icon={added ? Check : ShoppingCart} variant={added ? 'soft' : 'primary'} disabled={soldOut} loading={add.isPending} onClick={() => addToCart(false)} className="flex-1">
                  {added ? 'Added to cart' : `Add to cart · ${money(p.price * qty)}`}
                </Button>
                <button
                  onClick={() => (user ? wishlist.toggle.mutate(p.id) : navigate(`/login?redirect=/products/${p.id}`))}
                  className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`h-5 w-5 ${saved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                </button>
              </div>
              <Button size="lg" variant="secondary" icon={Zap} disabled={soldOut} onClick={() => addToCart(true)} className="w-full">
                Buy now
              </Button>
            </div>
          )}

          {!canShop && <NonShopperPanel product={p} />}

          <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" /><p><span className="font-bold">Secure checkout.</span> <span className="text-slate-500">Pay safely with Paystack — cards, bank transfer or USSD.</span></p></div>
            <div className="flex gap-3"><Truck className="h-5 w-5 shrink-0 text-brand-600" /><p><span className="font-bold">Shipped by {p.storeName}.</span> <span className="text-slate-500">Each vendor dispatches their own items.</span></p></div>
          </div>
        </div>
      </div>

      <ReviewsSection productId={p.id} list={list} average={average} loading={reviews.isPending} />
    </div>
  );
}

const RATING_LABEL = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function ReviewsSection({ productId, list, average, loading }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const mine = user ? list.find((r) => r.userId === user.id) : null;

  const submit = useMutation({
    mutationFn: () =>
      api(`/api/products/${productId}/reviews`, { method: 'POST', body: { rating, comment: comment.trim() || null } }),
    onSuccess: () => {
      toast.success('Thanks for your review!');
      setComment('');
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (e) => toast.error(e.message),
  });

  const send = () => {
    if (!rating) return toast.error('Tap a star to rate this product first');
    return submit.mutate();
  };

  const distribution = [5, 4, 3, 2, 1].map((n) => ({ n, count: list.filter((r) => r.rating === n).length }));

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-extrabold">Customer ratings & reviews</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <p className="text-5xl font-extrabold">{list.length ? average.toFixed(1) : '–'}</p>
            <div className="mt-1"><Stars value={average} size="h-5 w-5" /></div>
            <p className="mt-1 text-xs text-slate-500">{list.length} verified {list.length === 1 ? 'review' : 'reviews'}</p>
            <div className="mt-4 space-y-2">
              {distribution.map(({ n, count }) => (
                <div key={n} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-10">{n} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: list.length ? `${(count / list.length) * 100}%` : 0 }} />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {user?.role === 'CUSTOMER' &&
            (mine ? (
              <div className="card p-6">
                <h3 className="font-bold">Your review</h3>
                <div className="mt-2"><Stars value={mine.rating} size="h-5 w-5" /></div>
                {mine.comment && <p className="mt-2 text-sm text-slate-600">{mine.comment}</p>}
                <p className="mt-3 text-xs text-slate-500">Thanks for reviewing! Each product can be reviewed once.</p>
              </div>
            ) : (
              <div className="card p-6">
                <h3 className="font-bold">Write a review</h3>
                <p className="mb-4 text-xs text-slate-500">Only customers whose order has been paid can review a product.</p>
                <StarPicker value={rating} onChange={setRating} />
                <p className="mb-4 mt-1 h-4 text-xs font-semibold text-amber-600">{RATING_LABEL[rating]}</p>
                <Field label="Your feedback (optional)">
                  <Textarea rows={4} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like or dislike?" />
                </Field>
                <Button className="mt-3 w-full" loading={submit.isPending} onClick={send}>Submit review</Button>
              </div>
            ))}
        </div>

        <div className="space-y-4">
          {loading ? (
            <PageLoader label="Loading reviews…" />
          ) : list.length === 0 ? (
            <div className="card"><EmptyState title="No reviews yet" description="Be the first to share your experience after buying this product." /></div>
          ) : (
            list.map((r) => (
              <article key={r.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{initials(r.reviewerName)}</span>
                  <div>
                    <p className="text-sm font-bold">{r.reviewerName}</p>
                    <p className="text-xs text-slate-500">{formatDate(r.createdAt)} · Verified buyer</p>
                  </div>
                  <div className="ml-auto"><Stars value={r.rating} /></div>
                </div>
                {r.comment && <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/** Shown instead of the buy buttons when a vendor or admin is logged in. */
function NonShopperPanel({ product }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const myStore = useQuery({ queryKey: ['my-store'], queryFn: () => api('/api/stores/me'), enabled: user.role === 'VENDOR', retry: false });
  const isOwner = user.role === 'VENDOR' && myStore.data?.id === product.storeId;

  return (
    <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-5">
      <p className="font-bold text-slate-900">
        {isOwner ? 'This is your product' : `You're signed in as ${user.role === 'VENDOR' ? 'a vendor' : 'an admin'}`}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {isOwner
          ? 'Customers see the Add to cart button here. Update the price, stock and photos from your vendor hub.'
          : "Vendor and admin accounts can't place orders. Log out and sign in with a customer account to shop."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {isOwner && (
          <Link to="/vendor/products">
            <Button icon={Pencil}>Manage in vendor hub</Button>
          </Link>
        )}
        <Button
          variant={isOwner ? 'secondary' : 'primary'}
          onClick={() => {
            logout();
            navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`);
          }}
        >
          Log out & shop as a customer
        </Button>
      </div>
    </div>
  );
}
