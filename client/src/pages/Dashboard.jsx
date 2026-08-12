import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { PlusCircle, TrendingUp, Award, Clock, FileWarning } from 'lucide-react';
import api from '../services/api.js';
import Card from '../components/Card.jsx';
import ChartCard from '../components/ChartCard.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Badge from '../components/Badge.jsx';

const PIE_COLORS = ['#2563EB', '#3B82F6', '#0EA5E9', '#93C5FD', '#1D4ED8', '#60A5FA'];

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="font-data text-xl font-semibold text-ink-900">{value}</p>
        {sub && <p className="text-xs text-ink-500">{sub}</p>}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: null, reports: [] });

  const load = async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await api.get('/reports', { params: { limit: 50, sort: 'newest' } });
      setState({ loading: false, error: null, reports: res.data.data.reports });
    } catch (err) {
      setState({ loading: false, error: 'Unable to load your dashboard right now.', reports: [] });
    }
  };

  useEffect(() => { load(); }, []);

  if (state.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (state.error) return <ErrorState description={state.error} onRetry={load} />;

  const completed = state.reports.filter((r) => r.status === 'completed');
  const total = state.reports.length;
  const avgScore = completed.length ? Math.round(completed.reduce((s, r) => s + (r.score?.total || 0), 0) / completed.length) : 0;
  const highest = completed.length ? Math.max(...completed.map((r) => r.score?.total || 0)) : 0;
  const recent = state.reports[0];

  if (total === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <div className="mt-8">
          <EmptyState
            icon={FileWarning}
            title="No startup analyses yet."
            description="Submit your first startup idea and get a structured AI-assisted validation report."
            action={<Link to="/validate"><Button><PlusCircle className="h-4 w-4" /> Analyze Your First Idea</Button></Link>}
          />
        </div>
      </div>
    );
  }

  const trendData = [...state.reports].reverse().slice(-12).map((r, i) => ({
    name: new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: r.score?.total || 0,
  }));

  const industryMap = {};
  state.reports.forEach((r) => {
    const industry = r.startupIdeaId?.industry || 'Other';
    industryMap[industry] = (industryMap[industry] || 0) + 1;
  });
  const industryData = Object.entries(industryMap).map(([name, value]) => ({ name, value }));

  const scoreBuckets = [
    { name: '0-39', count: 0 }, { name: '40-59', count: 0 }, { name: '60-74', count: 0 },
    { name: '75-89', count: 0 }, { name: '90-100', count: 0 },
  ];
  completed.forEach((r) => {
    const s = r.score?.total || 0;
    if (s < 40) scoreBuckets[0].count++;
    else if (s < 60) scoreBuckets[1].count++;
    else if (s < 75) scoreBuckets[2].count++;
    else if (s < 90) scoreBuckets[3].count++;
    else scoreBuckets[4].count++;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink-900">Dashboard</h1>
        <Link to="/validate"><Button><PlusCircle className="h-4 w-4" /> New Validation</Button></Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Total Validations" value={total} />
        <StatCard icon={Award} label="Average Score" value={avgScore} sub="out of 100" />
        <StatCard icon={Award} label="Highest Score" value={highest} sub="out of 100" />
        <StatCard icon={Clock} label="Recent Analysis" value={recent?.startupIdeaId?.startupName || '-'} sub={recent?.status} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Validation Trend" subtitle="Score over your recent validations">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Industry Distribution" subtitle="Ideas analyzed by industry">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={industryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {industryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Score Distribution" subtitle="Completed reports by score band" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94A3B8" />
              <Tooltip />
              <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-ink-900">Recent reports</h3>
          <Link to="/history" className="text-sm font-semibold text-brand">View all</Link>
        </div>
        <div className="divide-y divide-ink-300/60">
          {state.reports.slice(0, 5).map((r) => (
            <Link key={r._id} to={r.status === 'completed' ? `/report/${r._id}` : '#'} className="flex items-center justify-between py-3 hover:bg-slate-50">
              <div>
                <p className="text-sm font-medium text-ink-900">{r.startupIdeaId?.startupName || 'Untitled'}</p>
                <p className="text-xs text-ink-500">{r.startupIdeaId?.industry} &middot; {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                {r.status === 'completed' && <span className="font-data text-sm text-ink-900">{r.score?.total}/100</span>}
                <Badge tone={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'danger' : 'warning'}>{r.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
