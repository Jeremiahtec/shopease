import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Package, Star, X } from 'lucide-react';

/* ---------- Button ---------- */
const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
};
const SIZES = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-sm' };

export function Button({ variant = 'primary', size = 'md', loading = false, icon: Icon, className = '', children, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

/* ---------- Form controls ---------- */
const CONTROL =
  'w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-500';

export function Input({ icon: Icon, className = '', ...props }) {
  if (!Icon) return <input {...props} className={`h-10 px-3 ${CONTROL} ${className}`} />;
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input {...props} className={`h-10 pl-9 pr-3 ${CONTROL} ${className}`} />
    </div>
  );
}

export function Textarea({ className = '', ...props }) {
  return <textarea {...props} className={`px-3 py-2.5 ${CONTROL} ${className}`} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select {...props} className={`h-10 px-3 ${CONTROL} ${className}`}>
      {children}
    </select>
  );
}

export function Field({ label, error, hint, required, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label className="label">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

/* ---------- Badges ---------- */
const TONES = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  indigo: 'bg-brand-50 text-brand-700 ring-brand-600/15',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/15',
};

export function Badge({ tone = 'slate', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_TONES = {
  PENDING: 'amber',
  PAID: 'blue',
  PROCESSING: 'indigo',
  SHIPPED: 'violet',
  DELIVERED: 'green',
  CANCELLED: 'red',
  ACTIVE: 'green',
  INACTIVE: 'slate',
  SUCCESS: 'green',
  FAILED: 'red',
};

export function StatusBadge({ status }) {
  return <Badge tone={STATUS_TONES[status] ?? 'slate'}>{status}</Badge>;
}

/* ---------- Feedback ---------- */
export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} />;
}

/** Branded loading state: pulsing logo + bouncing dots. Fades in after 150ms so quick loads never flash. */
export function BrandLoader({ label, fullScreen = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{ animationDelay: '150ms' }}
      className={`flex animate-fade-in flex-col items-center justify-center gap-5 ${fullScreen ? 'min-h-screen bg-slate-50' : 'min-h-[50vh]'}`}
    >
      <img src="/logo.png" alt="ShopEase" className="h-10 w-auto animate-logo-pulse" />
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-dot rounded-full bg-brand-600" style={{ animationDelay: `${i * 160}ms` }} />
        ))}
      </div>
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}

export function PageLoader({ label }) {
  return <BrandLoader label={label} />;
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold">Something went wrong</h3>
      <p className="text-sm text-slate-500">{error?.message || 'We could not load this page.'}</p>
      {error?.status === undefined && (
        <p className="text-xs text-slate-400">Is the backend running on http://localhost:8080?</p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = Package, title, description, children }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}

/* ---------- Layout helpers ---------- */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, subtitle, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        className={`flex max-h-[92vh] w-full animate-scale-in flex-col overflow-hidden rounded-t-2xl bg-white shadow-pop sm:rounded-2xl ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  const base = 'flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold transition-colors';
  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button disabled={page === 0} onClick={() => onChange(page - 1)} className={`${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onChange(p)} className={`${base} ${p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
          {p + 1}
        </button>
      ))}
      <button disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} className={`${base} border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40`} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ---------- Media ---------- */
export function ProductImage({ src, alt = '', className = '' }) {
  return src ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.classList.remove('hidden');
      }}
    />
  ) : (
    <Placeholder className={className} />
  );
}

function Placeholder({ className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 text-brand-200 ${className}`}>
      <Package className="h-1/3 w-1/3 max-h-16 max-w-16" />
    </div>
  );
}

/** Image with a built-in fallback tile (used where a hidden sibling is needed). */
export function Thumb({ src, alt, className = '' }) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <ProductImage src={src} alt={alt} className="h-full w-full" />
      {src && <Placeholder className="hidden h-full w-full" />}
    </div>
  );
}

export function Stars({ value = 0, size = 'h-4 w-4' }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? 'fill-current' : 'text-slate-200'}`} />
      ))}
    </span>
  );
}

export function Logo({ className = 'h-9' }) {
  return <img src="/logo.png" alt="ShopEase" className={`w-auto ${className}`} />;
}

/** Click-to-rate control: five stars, hover preview, keyboard/screen-reader friendly. */
export function StarPicker({ value = 0, onChange, size = 'h-8 w-8' }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <Star className={`${size} transition-colors ${n <= shown ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
}
