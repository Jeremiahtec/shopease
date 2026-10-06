import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, initials } from '../../lib/format';
import { Badge, Button, ErrorState, PageHeader, PageLoader, Pagination, Select } from '../../components/ui';

const ROLE_TONE = { CUSTOMER: 'blue', VENDOR: 'violet', ADMIN: 'slate' };

export default function Users() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [role, setRole] = useState('');

  const users = useQuery({
    queryKey: ['admin', 'users', role, page],
    queryFn: () => api('/api/admin/users', { params: { role, page, size: 10 } }),
    placeholderData: keepPreviousData,
  });

  const toggle = useMutation({
    mutationFn: ({ id, suspend }) => api(`/api/admin/vendors/${id}/${suspend ? 'suspend' : 'activate'}`, { method: 'PUT' }),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (e) => toast.error(e.message),
  });

  if (users.isPending) return <PageLoader />;
  if (users.isError) return <ErrorState error={users.error} onRetry={users.refetch} />;

  return (
    <>
      <PageHeader
        eyebrow="Operational console"
        title="Users management"
        description="Every account on the platform. Vendors can be suspended or reinstated."
        actions={
          <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }} className="w-44">
            <option value="">All roles</option><option value="CUSTOMER">Customers</option><option value="VENDOR">Vendors</option><option value="ADMIN">Admins</option>
          </Select>
        }
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50"><tr><th className="th">User</th><th className="th">Role</th><th className="th">Phone</th><th className="th">Joined</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {users.data.content.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{initials(u.fullName)}</span>
                      <div><p className="font-bold text-slate-900">{u.fullName}</p><p className="text-xs text-slate-400">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="td"><Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge></td>
                  <td className="td">{u.phone || '—'}</td>
                  <td className="td">{formatDate(u.createdAt)}</td>
                  <td className="td"><Badge tone={u.enabled ? 'green' : 'red'}>{u.enabled ? 'ACTIVE' : 'SUSPENDED'}</Badge></td>
                  <td className="td text-right">
                    {u.role === 'VENDOR' ? (
                      <Button size="sm" variant={u.enabled ? 'danger' : 'soft'} loading={toggle.isPending && toggle.variables?.id === u.id} onClick={() => toggle.mutate({ id: u.id, suspend: u.enabled })}>
                        {u.enabled ? 'Suspend' : 'Reinstate'}
                      </Button>
                    ) : <span className="text-xs text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 p-4"><Pagination page={page} totalPages={users.data.totalPages} onChange={setPage} /></div>
      </div>
    </>
  );
}
