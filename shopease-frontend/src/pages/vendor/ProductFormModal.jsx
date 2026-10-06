import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Button, Field, Input, Modal, Select, Textarea } from '../../components/ui';

const EMPTY = { name: '', description: '', price: '', stockQuantity: '', sku: '', categoryId: '', imageUrls: '', status: 'ACTIVE' };

export default function ProductFormModal({ open, product, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [newCategory, setNewCategory] = useState('');

  const categories = useQuery({ queryKey: ['categories'], queryFn: () => api('/api/categories', { params: { size: 100 } }), enabled: open });

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setNewCategory('');
    setForm(
      product
        ? {
            name: product.name,
            description: product.description ?? '',
            price: product.price,
            stockQuantity: product.stockQuantity,
            sku: product.sku,
            categoryId: product.categoryId,
            imageUrls: (product.imageUrls ?? []).join('\n'),
            status: product.status,
          }
        : EMPTY,
    );
  }, [open, product]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const createCategory = useMutation({
    mutationFn: () => api('/api/categories', { method: 'POST', body: { name: newCategory } }),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setForm((f) => ({ ...f, categoryId: category.id }));
      setNewCategory('');
      toast.success(`Category “${category.name}” created`);
    },
    onError: (e) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        sku: form.sku,
        categoryId: Number(form.categoryId),
        imageUrls: form.imageUrls.split('\n').map((u) => u.trim()).filter(Boolean),
        status: form.status,
      };
      return product ? api(`/api/products/${product.id}`, { method: 'PUT', body }) : api('/api/products', { method: 'POST', body });
    },
    onSuccess: () => {
      toast.success(product ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['vendor-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (e) => {
      setErrors(e.fields || {});
      toast.error(e.message);
    },
  });

  const cats = categories.data?.content ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={product ? 'Edit product' : 'Add a new product'}
      subtitle="Price in naira. Customers only see ACTIVE products."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={save.isPending} onClick={() => save.mutate()}>{product ? 'Save changes' : 'Create product'}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name" required error={errors.name} className="sm:col-span-2"><Input value={form.name} onChange={set('name')} maxLength={200} placeholder="Aura Pro Wireless Headphones" /></Field>
        <Field label="Price" required error={errors.price}><Input type="number" min="0.01" step="0.01" value={form.price} onChange={set('price')} placeholder="125000" /></Field>
        <Field label="Stock quantity" required error={errors.stockQuantity}><Input type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} placeholder="25" /></Field>
        <Field label="SKU" required error={errors.sku}><Input value={form.sku} onChange={set('sku')} maxLength={64} placeholder="APX-901-BLK" /></Field>
        <Field label="Status"><Select value={form.status} onChange={set('status')}><option value="ACTIVE">Active (visible)</option><option value="INACTIVE">Inactive (hidden)</option></Select></Field>

        <Field label="Category" required error={errors.categoryId} className="sm:col-span-2">
          <Select value={form.categoryId} onChange={set('categoryId')}>
            <option value="">Select a category…</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <div className="mt-2 flex gap-2">
            <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Or create a new category" className="h-9" />
            <Button size="md" variant="soft" disabled={!newCategory.trim()} loading={createCategory.isPending} onClick={() => createCategory.mutate()}>Add</Button>
          </div>
        </Field>

        <Field label="Description" error={errors.description} className="sm:col-span-2"><Textarea rows={4} maxLength={2000} value={form.description} onChange={set('description')} placeholder="Features, materials, what's in the box…" /></Field>
        <Field label="Image URLs" hint="One link per line. The first image is the cover photo." className="sm:col-span-2">
          <Textarea rows={3} value={form.imageUrls} onChange={set('imageUrls')} placeholder={'https://res.cloudinary.com/…/front.jpg\nhttps://res.cloudinary.com/…/side.jpg'} className="font-mono text-xs" />
        </Field>
      </div>
    </Modal>
  );
}
