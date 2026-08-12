import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-ink-300/60 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
            <div>
              <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <Gauge className="h-5 w-5 text-brand" aria-hidden="true" /> StartupIQ
              </Link>
              <p className="mt-2 max-w-xs text-sm text-ink-500">Validate your startup idea. Understand your market. Build smarter.</p>
            </div>
            <div className="flex gap-8 text-sm text-ink-500">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-ink-700">Product</span>
                <a href="/#features" className="hover:text-brand">Features</a>
                <a href="/#how-it-works" className="hover:text-brand">How it works</a>
                <Link to="/faq" className="hover:text-brand">FAQ</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-ink-700">Company</span>
                <Link to="/about" className="hover:text-brand">About</Link>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-ink-500">
            StartupIQ provides AI-assisted preliminary validation and decision-support analysis. It does not guarantee commercial success and is not financial, investment, or legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
