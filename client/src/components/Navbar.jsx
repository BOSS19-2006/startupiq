import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Gauge } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

const links = [
  { to: '/#features', label: 'Features' },
  { to: '/#how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-300/60 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
          <Gauge className="h-6 w-6 text-brand" aria-hidden="true" />
          StartupIQ
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.to} className="text-sm font-medium text-ink-700 hover:text-brand">{l.label}</a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link to="/dashboard"><Button>Go to Dashboard</Button></Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-ink-700 hover:text-brand">Login</Link>
              <Link to="/register"><Button>Get Started</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-ink-300/60 px-5 pb-4 md:hidden">
          {links.map((l) => (
            <a key={l.label} href={l.to} className="block py-2.5 text-sm font-medium text-ink-700" onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            {user ? (
              <Link to="/dashboard"><Button className="w-full">Go to Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="secondary" className="w-full">Login</Button></Link>
                <Link to="/register"><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
