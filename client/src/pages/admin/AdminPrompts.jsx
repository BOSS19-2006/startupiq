import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../../services/api.js';
import Card from '../../components/Card.jsx';
import Textarea from '../../components/Textarea.jsx';
import Button from '../../components/Button.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Badge from '../../components/Badge.jsx';

export default function AdminPrompts() {
  const [state, setState] = useState({ loading: true, error: null, templates: [] });
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(null);

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get('/admin/prompts');
      setState({ loading: false, error: null, templates: res.data.data.templates });
      const d = {};
      res.data.data.templates.forEach((t) => { d[t._id] = t.content; });
      setDrafts(d);
    } catch (err) {
      setState({ loading: false, error: apiErrorMessage(err), templates: [] });
    }
  };
  useEffect(() => { load(); }, []);

  const save = async (id) => {
    setSaving(id);
    try {
      await api.put(`/admin/prompts/${id}`, { content: drafts[id] });
      toast.success('Prompt template updated.');
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setSaving(null); }
  };

  const restore = async (id) => {
    setSaving(id);
    try {
      const res = await api.post(`/admin/prompts/${id}/restore`);
      toast.success('Restored default template.');
      setDrafts((d) => ({ ...d, [id]: res.data.data.template.content }));
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setSaving(null); }
  };

  if (state.loading) return <Skeleton className="h-64" />;
  if (state.error) return <ErrorState description={state.error} onRetry={load} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">AI Prompt Templates</h1>
      <p className="mt-1 text-sm text-ink-500">Edit the system instruction sent to the AI engine. Content is used as plain text only — it is never executed as code.</p>
      <div className="mt-6 space-y-6">
        {state.templates.map((t) => (
          <Card key={t._id}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold text-ink-900">{t.name}</h2>
                <p className="text-xs text-ink-500">Version {t.version} &middot; {t.active ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}</p>
              </div>
            </div>
            <Textarea id={`prompt-${t._id}`} rows={10} className="mt-4 font-data text-xs"
              value={drafts[t._id] || ''} onChange={(e) => setDrafts((d) => ({ ...d, [t._id]: e.target.value }))} />
            <div className="mt-4 flex gap-3">
              <Button loading={saving === t._id} onClick={() => save(t._id)}>Save</Button>
              <Button variant="secondary" loading={saving === t._id} onClick={() => restore(t._id)}>Restore Default</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
