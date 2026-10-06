const CURRENCY = import.meta.env.VITE_CURRENCY || 'NGN';
const formatter = new Intl.NumberFormat('en-NG', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 });

export const money = (value) => formatter.format(Number(value ?? 0));

/** The API sends UTC timestamps without a zone marker; read them as UTC so they show in the visitor's own time zone. */
export const parseApiDate = (iso) => new Date(/(Z|[+-]\d\d:?\d\d)$/i.test(iso) ? iso : `${iso}Z`);

export const formatDate = (iso, options) =>
  iso ? parseApiDate(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', ...options }) : '—';

export const formatDateTime = (iso) =>
  iso
    ? parseApiDate(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

export const roleHome = (role) => (role === 'VENDOR' ? '/vendor' : role === 'ADMIN' ? '/admin' : '/');

export function timeAgo(iso) {
  if (!iso) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - parseApiDate(iso).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return formatDate(iso);
}
