import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Trash2, FileClock, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../services/api.js';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { INDUSTRIES, STAGES } from '../constants/formOptions.js';

export default function History() {
  const [state, setState] = useState({ loading: true, error: null, reports: [], meta: {} });
  const [filters, setFilters] = useState({ search: '', industry: '', stage: '', sort: 'newest', page: 1 });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get('/reports', { params: { ...filters, limit: 10 } });
      setState({ loading: false, error: null, reports: res.data.data.reports, meta: res.data.meta || {} });
    } catch (err) {
      setState({ loading: false, error: apiErrorMessage(err, 'Unable to load history.'), reports: [], meta: {} });
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters.industry, filters.stage, filters.sort, filters.page]);

  const onSearchSubmit = (e) => { e.preventDefault(); setFilters((f) => ({ ...f, page: 1 })); load(); };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/reports/${toDelete}`);
      toast.success('Report deleted.');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to delete report.'));
    } finally { setDeleting(false); }
  };

  const downloadPdf = async (id, name) => {
    try {
      const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `StartupIQ-${name}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to download PDF.'));
    }
  };

  return (
    <div>
      <ConfirmDialog open={!!toDelete} title="Delete this report?" description="This cannot be undone."
        confirmLabel="Delete" loading={deleting} onConfirm={doDelete} onCancel={() => setToDelete(null)} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink-900">History</h1>
        <Link to="/validate"><Button><PlusCircle className="h-4 w-4" /> New Validation</Button></Link>
      </div>

      <Card className="mt-6">
        <form onSubmit={onSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Input id="search" label="Search" placeholder="Startup name..." value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
          </div>
          <Select id="industry" label="Industry" options={INDUSTRIES} value={filters.industry}
            onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value, page: 1 }))} />
          <Select id="stage" label="Business Stage" options={STAGES} value={filters.stage}
            onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value, page: 1 }))} />
          <Select id="sort" label="Sort" options={['newest', 'oldest', 'highest', 'lowest']} value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))} />
          <div className="lg:col-span-5">
            <Button type="submit" variant="secondary"><Search className="h-4 w-4" /> Apply filters</Button>
          </div>
        </form>
      </Card>

      <div className="mt-6">
        {state.loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : state.error ? (
          <ErrorState description={state.error} onRetry={load} />
        ) : state.reports.length === 0 ? (
          <EmptyState icon={FileClock} title="No reports match your filters." description="Try adjusting your search or filters, or create a new validation." />
        ) : (
          <Card className="overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-4 py-3">Startup</th><th className="px-4 py-3">Industry</th>
                    <th className="px-4 py-3">Score</th><th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.reports.map((r) => (
                    <tr key={r._id} className="border-t border-ink-300/40">
                      <td className="px-4 py-3 font-medium text-ink-900">{r.startupIdeaId?.startupName}</td>
                      <td className="px-4 py-3 text-ink-700">{r.startupIdeaId?.industry}</td>
                      <td className="px-4 py-3 font-data text-ink-900">{r.status === 'completed' ? `${r.score.total}/100` : '-'}</td>
                      <td className="px-4 py-3 text-ink-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Badge tone={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'danger' : 'warning'}>{r.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {r.status === 'completed' && (
                            <>
                              <Link to={`/report/${r._id}`}><Button variant="ghost" className="px-2 py-1.5 text-xs">View</Button></Link>
                              <button className="rounded-lg p-2 hover:bg-slate-100" aria-label="Download PDF" onClick={() => downloadPdf(r._id, r.startupIdeaId?.startupName)}>
                                <Download className="h-4 w-4 text-ink-700" />
                              </button>
                            </>
                          )}
                          <button className="rounded-lg p-2 hover:bg-rose-50" aria-label="Delete report" onClick={() => setToDelete(r._id)}>
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {state.meta.pages > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: state.meta.pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setFilters((f) => ({ ...f, page: p }))}
                className={`h-8 w-8 rounded-lg text-sm font-medium ${filters.page === p ? 'bg-brand text-white' : 'text-ink-700 hover:bg-slate-100'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
