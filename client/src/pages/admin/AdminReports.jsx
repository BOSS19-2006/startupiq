import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api, { apiErrorMessage } from '../../services/api.js';
import Card from '../../components/Card.jsx';
import Badge from '../../components/Badge.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';

export default function AdminReports() {
  const [state, setState] = useState({ loading: true, error: null, reports: [] });
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get('/admin/reports');
      setState({ loading: false, error: null, reports: res.data.data.reports });
    } catch (err) {
      setState({ loading: false, error: apiErrorMessage(err), reports: [] });
    }
  };
  useEffect(() => { load(); }, []);

  const doDelete = async () => {
    try {
      await api.delete(`/admin/reports/${toDelete}`);
      toast.success('Report deleted.');
      setToDelete(null);
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); }
  };

  return (
    <div>
      <ConfirmDialog open={!!toDelete} title="Delete this report?" confirmLabel="Delete" onConfirm={doDelete} onCancel={() => setToDelete(null)} />
      <h1 className="font-display text-2xl font-bold text-ink-900">Report Management</h1>
      <div className="mt-6">
        {state.loading ? <Skeleton className="h-64" /> : state.error ? <ErrorState description={state.error} onRetry={load} /> : (
          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-ink-500">
                  <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Startup</th><th className="px-4 py-3">Industry</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {state.reports.map((r) => (
                    <tr key={r._id} className="border-t border-ink-300/40">
                      <td className="px-4 py-3 text-ink-700">{r.userId?.name}<br /><span className="text-xs text-ink-500">{r.userId?.email}</span></td>
                      <td className="px-4 py-3 font-medium text-ink-900">{r.startupIdeaId?.startupName}</td>
                      <td className="px-4 py-3 text-ink-700">{r.startupIdeaId?.industry}</td>
                      <td className="px-4 py-3 font-data">{r.status === 'completed' ? `${r.score.total}/100` : <Badge tone="warning">{r.status}</Badge>}</td>
                      <td className="px-4 py-3 text-ink-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="rounded-lg p-2 hover:bg-rose-50" onClick={() => setToDelete(r._id)} aria-label="Delete report">
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </button>
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
