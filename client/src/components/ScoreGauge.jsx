import React from 'react';

function labelTone(total) {
  if (total >= 75) return { color: '#059669', ring: '#059669' };
  if (total >= 60) return { color: '#2563EB', ring: '#2563EB' };
  if (total >= 40) return { color: '#D97706', ring: '#D97706' };
  return { color: '#DC2626', ring: '#DC2626' };
}

/**
 * Instrument-style circular gauge - the product's signature visual element.
 * Renders 0-100 with tick marks like a diagnostic dial.
 */
export default function ScoreGauge({ score = 0, label = '', size = 180 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const tone = labelTone(clamped);
  const center = size / 2;

  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`StartupIQ score: ${clamped} out of 100, ${label}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {ticks.map((t) => {
          const angle = (t / 100) * 270 - 225;
          const rad = (angle * Math.PI) / 180;
          const inner = radius - 4;
          const outer = radius + (t % 20 === 0 ? 4 : 1);
          const x1 = center + inner * Math.cos(rad);
          const y1 = center + inner * Math.sin(rad);
          const x2 = center + outer * Math.cos(rad);
          const y2 = center + outer * Math.sin(rad);
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth="1.5" />;
        })}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx={center} cy={center} r={radius} fill="none" stroke={tone.ring} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x={center} y={center - 4} textAnchor="middle" className="font-data" fontSize={size * 0.22} fontWeight="600" fill="#0F172A">
          {Math.round(clamped)}
        </text>
        <text x={center} y={center + 20} textAnchor="middle" fontSize={size * 0.075} fill="#64748B">/ 100</text>
      </svg>
      {label && <p className="mt-1 text-sm font-semibold" style={{ color: tone.color }}>{label}</p>}
    </div>
  );
}
