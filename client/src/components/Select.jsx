import React from 'react';

export default function Select({ label, error, id, options, placeholder = 'Select...', className = '', ...props }) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>}
      <select
        id={id}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 focus-visible:outline-2 focus-visible:outline-brand ${error ? 'border-rose-400' : 'border-ink-300'} ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
