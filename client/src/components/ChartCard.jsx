import React from 'react';
import Card from './Card.jsx';

export default function ChartCard({ title, subtitle, children, action }) {
  return (
    <Card className="flex flex-col">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}
