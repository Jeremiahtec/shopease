import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/AuthShell';
import { Button, Field, Input } from '../components/ui';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <AuthShell title="Reset link missing" subtitle="This page needs the link from your reset email.">
        <Link to="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">Request a new link</Link>
      </AuthShell>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('The two passwords do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api('/api/auth/reset-password', { method: 'POST', body: { token, newPassword: password } });
      toast.success('Password changed. Please sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.fields?.newPassword || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters with a letter and a number.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password" required>
          <Input icon={Lock} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm new password" required>
          <Input icon={Lock} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} required />
        </Field>
        {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error} {error.includes('invalid or has expired') && <Link to="/forgot-password" className="font-semibold underline">Request a new link</Link>}</p>}
        <Button type="submit" size="lg" className="w-full" loading={busy}>Change password</Button>
      </form>
    </AuthShell>
  );
}
