import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Heart, ShoppingCart, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCartActions } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { money } from '../lib/format';
import { Button, Thumb } from './ui';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { add } = useCartActions();
  const wishlist = useWishlist();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.stockQuantity <= 0;
  const low = !soldOut && product.stockQuantity <= 5;
  const canShop = !user || user.role === 'CUSTOMER';
  const saved = wishlist.ids.has(product.id);

  const onHeart = () => {
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(`/products/${product.id}`)}`);
    if (wishlist.enabled) wishlist.toggle.mutate(product.id);
  };

  return (
    <article className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-pop">
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block">
          <Thumb src={product.imageUrls?.[0]} alt={product.name} className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.02]" />
        </Link>
        <Link
          to={`/stores/${product.storeId}`}
          className="absolute left-3 top-3 inline-flex max-w-[70%] items-center gap-1 truncate rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-card backdrop-blur hover:text-brand-700"
        >
          <Store className="h-3 w-3 shrink-0 text-brand-600" />
          <span className="truncate">{product.storeName}</span>
        </Link>
        {canShop && (
          <button
            onClick={onHeart}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-card transition-colors hover:bg-white"
          >
            <Heart className={`h-4 w-4 ${saved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
          </button>
        )}
        <span
          className={`absolute bottom-3 left-3 rounded px-2 py-0.5 text-[11px] font-semibold ${
            soldOut ? 'bg-rose-50 text-rose-700' : low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {soldOut ? 'Sold out' : low ? `Only ${product.stockQuantity} left` : `In stock · ${product.stockQuantity} left`}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{product.categoryName}</p>
        <Link to={`/products/${product.id}`} className="mt-0.5 line-clamp-1 text-base font-bold text-slate-900 hover:text-brand-700">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-xs leading-relaxed text-slate-500">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <span className="text-lg font-extrabold text-slate-900">{money(product.price)}</span>
          {canShop ? (
            <Button
              size="sm"
              icon={justAdded ? Check : ShoppingCart}
              variant={justAdded ? 'soft' : 'primary'}
              disabled={soldOut}
              loading={add.isPending && add.variables?.productId === product.id}
              onClick={() =>
                add.mutate(
                  { productId: product.id, quantity: 1 },
                  {
                    onSuccess: () => {
                      setJustAdded(true);
                      setTimeout(() => setJustAdded(false), 1600);
                    },
                  },
                )
              }
            >
              {justAdded ? 'Added' : 'Add'}
            </Button>
          ) : (
            <Link to={`/products/${product.id}`}>
              <Button size="sm" variant="secondary">View</Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-[4/3] bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-8 w-full rounded bg-slate-100" />
      </div>
    </div>
  );
}
