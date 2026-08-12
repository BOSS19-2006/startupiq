import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.jsx';

export default function Unauthorized() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="font-data text-6xl font-bold text-rose-500">403</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">You don't have access to this page</h1>
      <p className="mt-2 text-ink-500">This area is restricted. If you think this is a mistake, contact an administrator.</p>
      <Link to="/dashboard" className="mt-6"><Button>Back to dashboard</Button></Link>
    </div>
  );
}
