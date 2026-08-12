import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'What is StartupIQ?', a: 'StartupIQ is an AI-powered platform that analyzes a startup idea and produces a structured validation report covering SWOT, market sizing, business model, competitors, revenue models, investor feedback, and risk.' },
  { q: 'How does AI validate my startup idea?', a: 'You submit structured details about your idea. Our backend sends this to an AI engine with strict instructions to return structured analysis, which is validated and scored before being saved as a report.' },
  { q: 'Is the market size guaranteed to be accurate?', a: 'No. TAM/SAM/SOM figures are AI-generated estimates based on stated assumptions and should be validated against reliable market research before making financial or investment decisions.' },
  { q: 'Can I download my report?', a: 'Yes. Every completed report can be downloaded as a professional PDF from the report page.' },
  { q: 'Can I analyze multiple startup ideas?', a: 'Yes, you can create and analyze unlimited startup ideas, subject to a fair-use rate limit on analysis requests.' },
  { q: 'Is my startup data stored?', a: 'Yes, your submissions and reports are stored so you can revisit them later. Only you (and platform admins, for moderation) can access your reports.' },
  { q: 'Who can use StartupIQ?', a: 'Students, entrepreneurs, startup founders, and innovators exploring or refining a startup idea.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink-300/60 py-4">
      <button className="flex w-full items-center justify-between text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="font-medium text-ink-900">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-2 text-sm text-ink-500">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink-900">Frequently asked questions</h1>
      <div className="mt-8">
        {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
      </div>
      <p className="mt-8 rounded-lg bg-slate-50 p-4 text-sm text-ink-500">
        StartupIQ provides preliminary AI-assisted analysis and does not guarantee commercial success.
      </p>
    </div>
  );
}
