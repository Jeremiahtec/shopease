import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShoppingCart } from 'lucide-react';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { Button, PageLoader } from '../components/ui';

/** Paystack (or the mock gateway) sends the shopper back here with ?reference=... */
export default function PaymentCallback() {
  const [params] = useSearchParams();
  const reference = params.get('reference') || params.get('trxref');
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['payment', reference],
    queryFn: () => api(`/api/payments/verify/${reference}`),
    enabled: Boolean(reference),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (result.isSuccess) queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [result.isSuccess, queryClient]);

  if (!reference) {
    return <Shell tone="red" title="Missing payment reference" text="We could not tell which payment to check. Open your orders to see their status." orderLink="/account/orders" />;
  }
  if (result.isPending) return <PageLoader label="Verifying your payment…" />;
  if (result.isError) {
    return <Shell tone="red" title="Payment verification failed" text={result.error.message} reference={reference} orderLink="/account/orders" retry />;
  }

  const p = result.data;
  if (p.status === 'SUCCESS') {
    return (
      <Shell tone="green" title="Payment verified successfully!" text="Thank you for your order. Your payment was received and the vendors have been notified." reference={reference} payment={p} orderLink={`/account/orders/${p.orderId}`} />
    );
  }
  if (p.status === 'PENDING') {
    return <Shell tone="amber" title="Payment still pending" text="We have not received confirmation from Paystack yet. Check again in a moment." reference={reference} payment={p} orderLink={`/account/orders/${p.orderId}`} retry onRetry={() => result.refetch()} />;
  }
  return <Shell tone="red" title="Payment verification failed" text="Your card or account was not charged, and your order is still waiting for payment." reference={reference} payment={p} orderLink={`/account/orders/${p.orderId}`} retry />;
}

function Shell({ tone, title, text, reference, payment, orderLink, retry, onRetry }) {
  const cfg = {
    green: { icon: CheckCircle2, ring: 'bg-emerald-50 text-emerald-500', bar: 'from-brand-600 to-emerald-500' },
    amber: { icon: Clock, ring: 'bg-amber-50 text-amber-500', bar: 'from-amber-400 to-amber-500' },
    red: { icon: AlertTriangle, ring: 'bg-rose-50 text-rose-500', bar: 'from-rose-400 to-rose-500' },
  }[tone];
  const Icon = cfg.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="card overflow-hidden">
        <div className={`h-1.5 bg-gradient-to-r ${cfg.bar}`} />
        <div className="p-8 text-center sm:p-10">
          <span className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${cfg.ring}`}><Icon className="h-10 w-10" /></span>
          <h1 className="mt-5 text-3xl font-extrabold">{title}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{text}</p>

          {(reference || payment) && (
            <dl className="mt-8 grid gap-4 rounded-xl bg-slate-50 p-5 text-left text-sm sm:grid-cols-2">
              {payment && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Order</dt>
                  <dd className="mt-0.5 font-bold">#{payment.orderId}</dd>
                </div>
              )}
              {payment && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Amount</dt>
                  <dd className="mt-0.5 text-lg font-extrabold text-brand-600">{money(payment.amount)}</dd>
                </div>
              )}
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Payment reference</dt>
                <dd className="mt-0.5 break-all font-mono text-xs">{reference}</dd>
              </div>
            </dl>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {retry && onRetry && <Button onClick={onRetry}>Check again</Button>}
            <Link to={orderLink}><Button variant={tone === 'green' ? 'primary' : 'secondary'}>{tone === 'green' ? 'View order details' : retry ? 'Open order & retry payment' : 'View orders'}</Button></Link>
            {tone !== 'green' && <Link to="/cart"><Button variant="secondary" icon={ShoppingCart}>Return to cart</Button></Link>}
            <Link to="/" className="inline-flex h-10 items-center px-3 text-sm font-semibold text-brand-600 hover:underline">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
