import React from 'react';

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink-900">About StartupIQ</h1>
      <p className="mt-4 text-ink-500">
        StartupIQ is an AI-powered startup idea validation and business analysis platform built for students,
        entrepreneurs, founders, and innovators. It turns a startup idea into a structured report covering
        SWOT, market sizing, business model canvas, competitor analysis, revenue strategy, investor feedback,
        market analysis, and risk assessment.
      </p>
      <p className="mt-4 text-ink-500">
        StartupIQ does not claim to guarantee whether a startup will succeed. It provides AI-assisted
        preliminary validation and decision-support analysis to help you refine an idea before investing
        significant time or money.
      </p>
    </div>
  );
}
