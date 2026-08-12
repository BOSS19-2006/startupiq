import React from 'react';

export default function Input({ label, error, id, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500/70 focus-visible:outline-2 focus-visible:outline-brand ${error ? 'border-rose-400' : 'border-ink-300'} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
