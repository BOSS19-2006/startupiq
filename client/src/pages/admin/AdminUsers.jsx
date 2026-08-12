import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Ban, CheckCircle2, Trash2 } from 'lucide-react';
import api, { apiErrorMessage } from '../../services/api.js';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Input from '../../components/Input.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function AdminUsers() {
  const [state, setState] = useState({ loading: true, error: null, users: [] });
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get('/admin/users', { params: { search } });
      setState({ loading: false, error: null, users: res.data.data.users });
    } catch (err) {
      setState({ loading: false, error: apiErrorMessage(err), users: [] });
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const toggleStatus = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id}/status`, { status: u.status === 'active' ? 'disabled' : 'active' });
      toast.success(`User ${u.status === 'active' ? 'disabled' : 'enabled'}.`);
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/users/${toDelete}`);
      toast.success('User deleted.');
      setToDelete(null);
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); }
  };

  return (
    <div>
      <ConfirmDialog open={!!toDelete} title="Delete this user?" description="This deletes their account, startup ideas, and reports permanently."
        confirmLabel="Delete" onConfirm={doDelete} onCancel={() => setToDelete(null)} />
      <h1 className="font-display text-2xl font-bold text-ink-900">User Management</h1>

      <Card className="mt-6">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-3">
          <Input id="search" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        </form>
      </Card>

      <div className="mt-4">
        {state.loading ? <Skeleton className="h-64" /> : state.error ? <ErrorState description={state.error} onRetry={load} /> : (
          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-ink-500">
                  <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {state.users.map((u) => (
                    <tr key={u._id} className="border-t border-ink-300/40">
                      <td className="px-4 py-3 font-medium text-ink-900">{u.name}</td>
                      <td className="px-4 py-3 text-ink-700">{u.email}</td>
                      <td className="px-4 py-3"><Badge tone={u.role === 'admin' ? 'brand' : 'neutral'}>{u.role}</Badge></td>
                      <td className="px-4 py-3"><Badge tone={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                      <td className="px-4 py-3 text-ink-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <div className="flex justify-end gap-1">
                            <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => toggleStatus(u)} aria-label={u.status === 'active' ? 'Disable user' : 'Enable user'}>
                              {u.status === 'active' ? <Ban className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                            </button>
                            <button className="rounded-lg p-2 hover:bg-rose-50" onClick={() => setToDelete(u._id)} aria-label="Delete user">
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
