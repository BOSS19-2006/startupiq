import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', full = false }) {
  return (
    <div className={`flex items-center justify-center gap-2 text-ink-500 ${full ? 'min-h-[50vh]' : 'py-10'}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
