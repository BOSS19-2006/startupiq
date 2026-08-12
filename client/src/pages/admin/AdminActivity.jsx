import React, { useEffect, useState } from 'react';
import api, { apiErrorMessage } from '../../services/api.js';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Badge from '../../components/Badge.jsx';

export default function AdminActivity() {
  const [state, setState] = useState({ loading: true, error: null, logs: [] });

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get('/admin/activity');
      setState({ loading: false, error: null, logs: res.data.data.logs });
    } catch (err) {
      setState({ loading: false, error: apiErrorMessage(err), logs: [] });
    }
  };
  useEffect(() => { load(); }, []);

  if (state.loading) return <Skeleton className="h-64" />;
  if (state.error) return <ErrorState description={state.error} onRetry={load} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">System Activity</h1>
      <Card className="mt-6 overflow-hidden !p-0">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase text-ink-500">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Resource</th><th className="px-4 py-3">Time</th></tr>
            </thead>
            <tbody>
              {state.logs.map((l) => (
                <tr key={l._id} className="border-t border-ink-300/40">
                  <td className="px-4 py-3 text-ink-700">{l.userId?.name || 'Unknown'}</td>
                  <td className="px-4 py-3"><Badge tone="brand">{l.action}</Badge></td>
                  <td className="px-4 py-3 text-ink-700">{l.resource}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(l.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
