import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MailCheck } from 'lucide-react';
import { api } from '../lib/api';
import AuthShell from '../components/AuthShell';
import { Button, Field, Input } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/auth/forgot-password', { method: 'POST', body: { email } });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><MailCheck className="h-7 w-7" /></span>
          <p className="text-sm text-slate-600">
            If an account exists for <b>{email}</b>, we have sent a link to reset your password. It expires in 30 minutes.
          </p>
          <p className="text-xs text-slate-400">Nothing arrived? Check your spam folder, or try again in a few minutes.</p>
          <Link to="/login" className="mt-2 text-sm font-semibold text-brand-600 hover:underline">Back to sign in</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a link to choose a new one.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address" required>
          <Input icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
        </Field>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Send reset link</Button>
      </form>
    </AuthShell>
  );
}
