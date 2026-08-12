import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, FileClock, User, Settings, LogOut, X, Gauge, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const userLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/validate', label: 'New Validation', icon: PlusCircle },
  { to: '/history', label: 'History', icon: FileClock },
  { to: '/profile', label: 'Profile', icon: User },
];

const adminLinks = [
  { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck, end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/prompts', label: 'Prompt Templates' },
  { to: '/admin/activity', label: 'Activity' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Gauge className="h-6 w-6 text-brand" aria-hidden="true" /> StartupIQ
        </span>
        <button className="lg:hidden" onClick={onClose} aria-label="Close navigation"><X className="h-5 w-5" /></button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {userLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-blue-50 text-brand' : 'text-ink-700 hover:bg-slate-50'}`
          }>
            <Icon className="h-4.5 w-4.5" aria-hidden="true" /> {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Admin</p>
            {adminLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? 'bg-blue-50 text-brand' : 'text-ink-700 hover:bg-slate-50'}`
              }>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-ink-300/60 p-3">
        <NavLink to="/settings" onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-slate-50">
          <Settings className="h-4.5 w-4.5" aria-hidden="true" /> Settings
        </NavLink>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-slate-50">
          <LogOut className="h-4.5 w-4.5" aria-hidden="true" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-ink-300/60 bg-white lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
