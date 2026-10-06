import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Button, EmptyState, ErrorState, Field, Input, Modal, PageHeader, PageLoader, Pagination, Textarea } from '../../components/ui';

export default function Categories() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  const categories = useQuery({
    queryKey: ['categories', 'admin', page],
    queryFn: () => api('/api/categories', { params: { page, size: 10 } }),
    placeholderData: keepPreviousData,
  });

  const save = useMutation({
    mutationFn: () => {
      const body = { name: form.name, description: form.description || null };
      return editing ? api(`/api/categories/${editing.id}`, { method: 'PUT', body }) : api('/api/categories', { method: 'POST', body });
    },
    onSuccess: () => {
      toast.success(editing ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false);
    },
    onError: (e) => {
      setErrors(e.fields || {});
      toast.error(e.message);
    },
  });

  const openForm = (category = null) => {
    setEditing(category);
    setForm({ name: category?.name ?? '', description: category?.description ?? '' });
    setErrors({});
    setOpen(true);
  };

  if (categories.isPending) return <PageLoader />;
  if (categories.isError) return <ErrorState error={categories.error} onRetry={categories.refetch} />;

  return (
    <>
      <PageHeader eyebrow="Catalog management" title="Category management" description="Platform-wide product categories used by vendors and shoppers." actions={<Button icon={Plus} onClick={() => openForm()}>Create category</Button>} />

      <div className="card overflow-hidden">
        {categories.data.totalElements === 0 ? (
          <EmptyState title="No categories yet" description="Create the first category so vendors can list products."><Button icon={Plus} onClick={() => openForm()}>Create category</Button></EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50"><tr><th className="th">Category</th><th className="th">Description</th><th className="th">ID</th><th className="th text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {categories.data.content.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="td font-bold text-slate-900">{c.name}</td>
                    <td className="td max-w-md text-slate-500"><span className="line-clamp-1">{c.description || '—'}</span></td>
                    <td className="td font-mono text-xs text-slate-400">CAT-{String(c.id).padStart(3, '0')}</td>
                    <td className="td text-right"><button onClick={() => openForm(c)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600" aria-label="Edit"><Pencil className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-slate-100 p-4"><Pagination page={page} totalPages={categories.data.totalPages} onChange={setPage} /></div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit category: ${editing.name}` : 'Create category'}
        subtitle="Category names must be unique."
        footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Save category</Button></>}
      >
        <div className="space-y-4">
          <Field label="Category name" required error={errors.name}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} placeholder="Consumer Tech" /></Field>
          <Field label="Description" error={errors.description}><Textarea rows={3} maxLength={500} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Personal electronics, smart gadgets, audio equipment…" /></Field>
        </div>
      </Modal>
    </>
  );
}
