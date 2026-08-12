import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

export default function Settings() {
  const { logout } = useAuth();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
      <Card>
        <h2 className="font-display text-sm font-semibold text-ink-900">Session</h2>
        <p className="mt-1 text-sm text-ink-500">Log out of StartupIQ on this device.</p>
        <Button variant="secondary" className="mt-4" onClick={logout}>Log out</Button>
      </Card>
      <Card>
        <h2 className="font-display text-sm font-semibold text-ink-900">About StartupIQ</h2>
        <p className="mt-1 text-sm text-ink-500">
          StartupIQ provides AI-assisted preliminary validation and decision-support analysis. It does not guarantee
          commercial success and is not financial, investment, or legal advice.
        </p>
      </Card>
    </div>
  );
}
