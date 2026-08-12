import React from 'react';

export default function Textarea({ label, error, id, hint, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>}
      <textarea
        id={id}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/70 focus-visible:outline-2 focus-visible:outline-brand ${error ? 'border-rose-400' : 'border-ink-300'} ${className}`}
        aria-invalid={!!error}
        {...props}
      />
      <div className="mt-1 flex items-center justify-between">
        {error ? <p className="text-xs text-rose-600">{error}</p> : <span className="text-xs text-ink-500">{hint}</span>}
      </div>
    </div>
  );
}
