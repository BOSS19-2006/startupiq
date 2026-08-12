import React from 'react';

export default function Card({ children, className = '', as: As = 'div', ...props }) {
  return (
    <As className={`rounded-xl border border-ink-300/60 bg-white p-5 shadow-card ${className}`} {...props}>
      {children}
    </As>
  );
}
