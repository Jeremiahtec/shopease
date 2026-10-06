import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Store, Zap, ShoppingBag, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/format';
import { Button, Field, Input, Logo } from '../components/ui';

const FEATURES = [
  { icon: ShieldCheck, title: 'Secure by design', text: 'Passwords are hashed and payments are handled by Paystack.' },
  { icon: Store, title: 'Sell without setup fees', text: 'Open your store, list products and manage orders from one hub.' },
  { icon: Zap, title: 'Instant role routing', text: 'Shoppers, vendors and admins each land on the right dashboard.' },
];

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, register } = useAuth();
  const mode = location.pathname === '/register' ? 'register' : 'login';
  const redirect = params.get('redirect');

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', role: 'CUSTOMER' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setFieldErrors({});
    try {
      const user =
        mode === 'login'
          ? await login(form.email, form.password)
          : await register({ fullName: form.fullName, email: form.email, password: form.password, phone: form.phone || undefined, role: form.role });
      const safeRedirect = redirect && redirect.startsWith('/') && user.role === 'CUSTOMER' ? redirect : roleHome(user.role);
      navigate(safeRedirect, { replace: true });
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.fields || {});
    } finally {
      setBusy(false);
    }
  };

  const tab = (active) => `relative z-10 flex-1 py-2.5 text-center text-sm font-bold transition-colors duration-300 ${active ? 'text-brand-700' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <div className="min-h-screen animate-fade-in bg-gradient-to-br from-brand-50/60 via-white to-violet-50/60">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/"><Logo className="h-8" /></Link>
        <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-brand-700">← Back to marketplace</Link>
      </header>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="hidden lg:block">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Multi-vendor marketplace</span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.1]">One account for smarter shopping & scalable selling.</h1>
          <p className="mt-4 max-w-md text-slate-600">Connect directly with independent merchants, or launch your own storefront in minutes.</p>
          <div className="stagger mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card flex gap-4 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
                <div><p className="font-bold">{title}</p><p className="text-sm text-slate-500">{text}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="relative flex rounded-xl bg-slate-100 p-1">
            {/* sliding highlight behind the active tab */}
            <span aria-hidden="true" className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-card transition-transform duration-300 ease-out ${mode === 'register' ? 'translate-x-full' : ''}`} />
            <Link to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className={tab(mode === 'login')}>Sign in</Link>
            <Link to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className={tab(mode === 'register')}>Create account</Link>
          </div>

          <div key={mode} className="animate-swap">
          <h2 className="mt-6 text-2xl font-extrabold">{mode === 'login' ? 'Welcome back to ShopEase' : 'Create your ShopEase account'}</h2>
          <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Enter your credentials to access your buyer or merchant hub.' : 'Join as a shopper or open a vendor store.'}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'CUSTOMER', icon: ShoppingBag, title: 'I want to buy', text: 'Shop from vendors' },
                    { value: 'VENDOR', icon: Store, title: 'I want to sell', text: 'Open a store' },
                  ].map(({ value, icon: Icon, title, text }) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setForm((f) => ({ ...f, role: value }))}
                      className={`rounded-xl border-2 p-3 text-left transition-colors ${form.role === value ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <Icon className={`h-5 w-5 ${form.role === value ? 'text-brand-600' : 'text-slate-400'}`} />
                      <p className="mt-1 text-sm font-bold">{title}</p>
                      <p className="text-xs text-slate-500">{text}</p>
                    </button>
                  ))}
                </div>
                <Field label="Full name" required error={fieldErrors.fullName}><Input icon={User} value={form.fullName} onChange={set('fullName')} placeholder="Ada Okafor" required /></Field>
                <Field label="Phone (optional)" error={fieldErrors.phone}><Input icon={Phone} value={form.phone} onChange={set('phone')} placeholder="0801 234 5678" inputMode="tel" /></Field>
              </>
            )}

            <Field label="Email address" required error={fieldErrors.email}>
              <Input icon={Mail} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" required />
            </Field>

            <Field label="Password" required error={fieldErrors.password} hint={mode === 'register' ? 'At least 8 characters, with a letter and a number' : undefined}>
              <div className="relative">
                <Input icon={Lock} type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'register' ? 8 : undefined} />
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {mode === 'register' && (
              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-600">
                <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>
                  I agree to the <Link to="/legal/terms" target="_blank" className="font-semibold text-brand-600 underline">Terms of Service</Link> and{' '}
                  <Link to="/legal/privacy" target="_blank" className="font-semibold text-brand-600 underline">Privacy Policy</Link>
                  {form.role === 'VENDOR' && <> and the <Link to="/legal/vendors" target="_blank" className="font-semibold text-brand-600 underline">Vendor Terms</Link></>}.
                </span>
              </label>
            )}

            {mode === 'login' && (
              <div className="-mt-2 text-right">
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:underline">Forgot password?</Link>
              </div>
            )}

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <Button type="submit" size="lg" className="w-full" loading={busy} icon={ArrowRight}>
              {mode === 'login' ? 'Sign in to ShopEase' : 'Create account'}
            </Button>
          </form>
          </div>

          <p className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-bold">Browsing as a guest?</span> Items in your cart are kept and merged into your account when you sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
