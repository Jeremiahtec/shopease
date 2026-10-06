import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Field, Input } from '../../components/ui';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});

  const save = useMutation({
    mutationFn: () => api('/api/users/me', { method: 'PUT', body: { fullName: form.fullName, phone: form.phone || null } }),
    onSuccess: (updated) => {
      updateUser(updated);
      setErrors({});
      toast.success('Profile updated');
    },
    onError: (e) => {
      setErrors(e.fields || {});
      toast.error(e.message);
    },
  });

  const changePassword = useMutation({
    mutationFn: () => api('/api/users/me/password', { method: 'PUT', body: pw }),
    onSuccess: () => {
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    },
    onError: (e) => toast.error(e.fields?.newPassword || e.message),
  });

  return (
    <div className="space-y-5">
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="card p-6">
        <h2 className="text-xl font-bold">My profile</h2>
        <p className="mb-5 text-xs text-slate-500">Your name and phone appear on orders and receipts.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required error={errors.fullName}><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></Field>
          <Field label="Phone" error={errors.phone}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0801 234 5678" /></Field>
          <Field label="Email" hint="Email cannot be changed" className="sm:col-span-2"><Input value={user.email} disabled /></Field>
        </div>
        <Button type="submit" className="mt-5" loading={save.isPending}>Save changes</Button>
      </form>

      <form onSubmit={(e) => { e.preventDefault(); changePassword.mutate(); }} className="card p-6">
        <h2 className="text-xl font-bold">Change password</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Current password" required><Input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" required /></Field>
          <Field label="New password" required hint="At least 8 characters, with a letter and a number"><Input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" minLength={8} required /></Field>
        </div>
        <Button type="submit" variant="secondary" className="mt-5" loading={changePassword.isPending}>Update password</Button>
      </form>
    </div>
  );
}
