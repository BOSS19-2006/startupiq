import React from 'react';

export default function ReportSection({ title, eyebrow, children, className = '' }) {
  return (
    <section className={`scroll-mt-24 border-t border-ink-300/60 py-8 first:border-t-0 first:pt-0 ${className}`}>
      {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">{eyebrow}</p>}
      <h2 className="mb-4 font-display text-xl font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}
