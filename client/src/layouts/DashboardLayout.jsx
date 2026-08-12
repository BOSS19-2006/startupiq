import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-300/60 bg-white px-5 py-3.5">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5 text-ink-700" />
          </button>
          <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border border-ink-300 px-3 py-2 sm:flex">
            <Search className="h-4 w-4 text-ink-500" aria-hidden="true" />
            <input placeholder="Search reports..." className="w-full text-sm outline-none placeholder:text-ink-500" aria-label="Search reports" />
          </div>
          <div className="flex items-center gap-4">
            <button aria-label="Notifications" className="rounded-full p-2 hover:bg-slate-100">
              <Bell className="h-5 w-5 text-ink-700" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden text-sm font-medium text-ink-900 sm:inline">{user?.name}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
