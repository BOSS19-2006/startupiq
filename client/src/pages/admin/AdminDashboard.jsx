import React, { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, Activity, AlertOctagon, UserCheck } from 'lucide-react';
import api, { apiErrorMessage } from '../../services/api.js';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import ErrorState from '../../components/ErrorState.jsx';

function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-brand"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-xs font-medium text-ink-500">{label}</p>
        <p className="font-data text-xl font-semibold text-ink-900">{value}</p>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => setState({ loading: false, error: null, data: res.data.data }))
      .catch((err) => setState({ loading: false, error: apiErrorMessage(err), data: null }));
  }, []);

  if (state.loading) return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  if (state.error) return <ErrorState description={state.error} />;

  const d = state.data;
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total Users" value={d.totalUsers} />
        <Stat icon={UserCheck} label="Active Users" value={d.activeUsers} />
        <Stat icon={FileText} label="Total Reports" value={d.totalReports} />
        <Stat icon={TrendingUp} label="Average Score" value={d.averageScore} />
        <Stat icon={Activity} label="Reports This Week" value={d.reportsThisWeek} />
        <Stat icon={Activity} label="Reports This Month" value={d.reportsThisMonth} />
        <Stat icon={AlertOctagon} label="Failed AI Requests" value={d.failedAiRequests} />
        <Stat icon={Users} label="New Users This Week" value={d.newUsersThisWeek} />
      </div>

      <Card className="mt-6">
        <h2 className="font-display text-sm font-semibold text-ink-900">Top Industries</h2>
        <ul className="mt-3 space-y-2">
          {d.topIndustries.map((i) => (
            <li key={i.industry} className="flex items-center justify-between text-sm">
              <span className="text-ink-700">{i.industry}</span>
              <span className="font-data text-ink-900">{i.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
