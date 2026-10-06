import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageIcon, Store as StoreIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Button, Field, Input, Textarea } from '../../components/ui';

/** Creates the vendor's store the first time, then edits it afterwards. */
export default function StoreForm({ store }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: store?.name ?? '', description: store?.description ?? '', logoUrl: store?.logoUrl ?? '' });
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = useMutation({
    mutationFn: () => {
      const body = { name: form.name, description: form.description || null, logoUrl: form.logoUrl || null };
      return store ? api(`/api/stores/${store.id}`, { method: 'PUT', body }) : api('/api/stores', { method: 'POST', body });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(['my-store'], saved);
      setErrors({});
      toast.success(store ? 'Store settings saved' : 'Your store is live!');
    },
    onError: (e) => {
      setErrors(e.fields || {});
      toast.error(e.message);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><StoreIcon className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold">General brand identity</h2>
            <p className="text-xs text-slate-500">Shown on your public storefront and on product cards.</p>
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Store display name" required error={errors.name}>
            <Input value={form.name} onChange={set('name')} maxLength={150} required placeholder="Apex Audio Official" />
            <p className="mt-1 text-right text-[11px] text-slate-400">{form.name.length} / 150</p>
          </Field>
          <Field label="Store description" error={errors.description}>
            <Textarea rows={4} maxLength={1000} value={form.description} onChange={set('description')} placeholder="Tell shoppers what makes your store special" />
            <p className="mt-1 text-right text-[11px] text-slate-400">{form.description.length} / 1000</p>
          </Field>
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><ImageIcon className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold">Store logo</h2>
            <p className="text-xs text-slate-500">Paste an image link (e.g. from Cloudinary).</p>
          </div>
        </div>
        <div className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
          {form.logoUrl ? <img src={form.logoUrl} alt="Logo preview" className="h-full w-full object-contain" onError={(e) => (e.currentTarget.style.opacity = 0.2)} onLoad={(e) => (e.currentTarget.style.opacity = 1)} /> : <StoreIcon className="h-10 w-10 text-slate-300" />}
        </div>
        <Field label="Logo URL" error={errors.logoUrl}><Input value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://…" maxLength={500} /></Field>
      </section>

      <div className="flex justify-end gap-3 lg:col-span-2">
        <Button type="submit" size="lg" loading={save.isPending}>{store ? 'Save changes' : 'Create my store'}</Button>
      </div>
    </form>
  );
}
