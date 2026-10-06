import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, MapPin, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';
import { money } from '../lib/format';
import { Button, Field, Input, PageLoader, Select, Textarea, Thumb } from '../components/ui';

const NG_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

export default function Checkout() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cart = useCart();
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || '', street: '', apt: '', city: '', state: 'Oyo', postal: '', note: '' });
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const pay = useMutation({
    mutationFn: async () => {
      const address = [
        `${form.fullName}, ${form.phone}`,
        [form.street, form.apt].filter(Boolean).join(', '),
        [form.city, form.state, form.postal].filter(Boolean).join(', '),
        'Nigeria',
        form.note ? `Note: ${form.note}` : null,
      ].filter(Boolean).join('\n');

      const order = await api('/api/orders', { method: 'POST', body: { shippingAddress: address } });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      try {
        const payment = await api('/api/payments/initialize', { method: 'POST', body: { orderId: order.id } });
        return { order, payment };
      } catch (error) {
        // The order exists, so let the customer retry the payment from its page
        toast.error(`Order #${order.id} was created but payment could not start: ${error.message}`);
        navigate(`/account/orders/${order.id}`);
        return null;
      }
    },
    onSuccess: (result) => {
      if (result) window.location.assign(result.payment.authorizationUrl);
    },
    onError: (error) => toast.error(error.message),
  });

  if (cart.isPending) return <PageLoader />;
  if (!cart.data || cart.data.items.length === 0) return <Navigate to="/cart" replace />;

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Required';
    if (!/^[0-9+\-\s]{7,20}$/.test(form.phone)) next.phone = 'Enter a valid phone number';
    if (!form.street.trim()) next.street = 'Required';
    if (!form.city.trim()) next.city = 'Required';
    setErrors(next);
    if (Object.keys(next).length === 0) pay.mutate();
  };

  const items = cart.data.items;
  const vendors = new Set(items.map((i) => i.storeName)).size;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-700"><Lock className="h-3 w-3" /> Secure checkout</span>
          <h1 className="mt-2 text-3xl font-extrabold">Checkout</h1>
        </div>
        <Link to="/cart" className="text-sm font-semibold text-slate-500 hover:text-brand-700">← Back to cart</Link>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600">1</span>
              <div>
                <h2 className="font-bold">Delivery address & contact</h2>
                <p className="text-xs text-slate-500">Where should vendors dispatch your orders?</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.fullName}><Input value={form.fullName} onChange={set('fullName')} /></Field>
              <Field label="Phone number" required error={errors.phone}><Input value={form.phone} onChange={set('phone')} placeholder="0801 234 5678" inputMode="tel" /></Field>
              <Field label="Street address" required error={errors.street} className="sm:col-span-2"><Input value={form.street} onChange={set('street')} placeholder="12 Ilorin Road" /></Field>
              <Field label="Apartment / landmark"><Input value={form.apt} onChange={set('apt')} placeholder="Opposite the market" /></Field>
              <Field label="City / town" required error={errors.city}><Input value={form.city} onChange={set('city')} placeholder="Ogbomoso" /></Field>
              <Field label="State" required>
                <Select value={form.state} onChange={set('state')}>{NG_STATES.map((s) => <option key={s}>{s}</option>)}</Select>
              </Field>
              <Field label="Postal code"><Input value={form.postal} onChange={set('postal')} /></Field>
              <Field label="Delivery notes (optional)" className="sm:col-span-2">
                <Textarea rows={3} maxLength={200} value={form.note} onChange={set('note')} placeholder="e.g. call on arrival, leave with security" />
              </Field>
            </div>
          </section>

          <section className="card p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-600">2</span>
              <div>
                <h2 className="font-bold">Payment</h2>
                <p className="text-xs text-slate-500">You will be redirected to Paystack to complete payment.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-brand-50 p-4 text-sm text-slate-600">
              <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" />
              <p>Pay with card, bank transfer or USSD through Paystack. Your card details never touch ShopEase servers.</p>
            </div>
            <Button type="submit" size="lg" className="mt-5 w-full" icon={Lock} loading={pay.isPending}>
              Place order & pay {money(cart.data.totalAmount)}
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500">By placing your order you agree to our <Link to="/legal/terms" target="_blank" className="font-semibold text-brand-600 underline">Terms of Service</Link>.</p>
          </section>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Order summary</h2>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{cart.data.totalItems}</span>
          </div>
          <p className="mb-4 text-xs text-slate-500">{items.length} {items.length === 1 ? 'product' : 'products'} from {vendors} {vendors === 1 ? 'vendor' : 'vendors'}</p>
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                <Thumb src={i.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-bold">{i.productName}</p>
                  <p className="text-[11px] text-slate-500">{i.storeName} · Qty {i.quantity}</p>
                </div>
                <p className="text-sm font-bold">{money(i.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
            <span className="font-bold">Total due</span>
            <span className="text-3xl font-extrabold text-brand-600">{money(cart.data.totalAmount)}</span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Delivery fees, if any, are agreed with each vendor.</p>
        </aside>
      </form>
    </div>
  );
}
