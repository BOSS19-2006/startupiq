import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Scale, TrendingUp, Users, LayoutGrid, DollarSign, Handshake, ShieldAlert,
  ArrowRight, CheckCircle2,
} from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge.jsx';
import Badge from '../components/Badge.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

const features = [
  { icon: Brain, title: 'AI Idea Analysis', desc: 'Understand and structure the startup idea into a normalized problem, solution, and value proposition.' },
  { icon: Scale, title: 'SWOT Analysis', desc: 'Identify strengths, weaknesses, opportunities, and threats specific to your idea.' },
  { icon: TrendingUp, title: 'Market Sizing', desc: 'Estimate TAM, SAM, and SOM with stated methodology, assumptions, and confidence.' },
  { icon: Users, title: 'Competitor Analysis', desc: 'Identify likely competitors and compare strengths, weaknesses, and differentiation.' },
  { icon: LayoutGrid, title: 'Business Model Canvas', desc: 'Generate a complete 9-block business model canvas for your idea.' },
  { icon: DollarSign, title: 'Revenue Strategy', desc: 'Get recommended revenue models with pros, risks, and implementation difficulty.' },
  { icon: Handshake, title: 'Investor Feedback', desc: 'See investment attractiveness, funding readiness, and likely investor questions.' },
  { icon: ShieldAlert, title: 'Risk Assessment', desc: 'Surface market, product, technical, financial, and execution risks with mitigations.' },
];

const steps = [
  { n: '01', title: 'Enter Your Idea', desc: 'Provide startup name, problem, solution, market, and target audience.' },
  { n: '02', title: 'AI Analyzes It', desc: 'StartupIQ sends structured information to the AI engine.' },
  { n: '03', title: 'Review Your Analysis', desc: 'Receive business, market, competitor, revenue, and risk insights.' },
  { n: '04', title: 'Make Better Decisions', desc: 'Use the report to refine and strengthen the startup idea.' },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge tone="brand">AI-Powered Startup Idea Validation & Business Analysis</Badge>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-ink-900 sm:text-5xl">
              Validate Your Startup Idea with AI
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-500">
              Turn your startup idea into a structured business analysis using AI-powered market, competition, business model, revenue, risk, and investor insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register"><Button className="px-6 py-3 text-base">Start Validation <ArrowRight className="h-4 w-4" /></Button></Link>
              <a href="#how-it-works"><Button variant="secondary" className="px-6 py-3 text-base">See How It Works</Button></a>
            </div>
            <p className="mt-6 text-xs text-ink-500">Preliminary AI-assisted analysis — not a guarantee of commercial success.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="mx-auto max-w-md">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-sm font-semibold text-ink-900">CampusCart</p>
                  <p className="text-xs text-ink-500">E-commerce &middot; MVP stage</p>
                </div>
                <Badge tone="success">Promising</Badge>
              </div>
              <div className="flex items-center justify-center py-2">
                <ScoreGauge score={68} label="Promising" size={160} />
              </div>
              <div className="mt-4 space-y-2 font-data text-xs text-ink-500">
                <div className="flex justify-between"><span>Innovation</span><span>14 / 20</span></div>
                <div className="flex justify-between"><span>Market Demand</span><span>15 / 20</span></div>
                <div className="flex justify-between"><span>Business Model</span><span>10 / 15</span></div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">What StartupIQ generates</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">Eight structured analyses, one submission</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="transition-shadow hover:shadow-lg">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-brand">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-sm font-semibold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-500">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-ink-300/60 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">Process</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink-900">How it works</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n}>
                <span className="font-data text-3xl font-semibold text-brand/30">{s.n}</span>
                <h3 className="mt-2 font-display text-base font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8">
        <h2 className="font-display text-3xl font-bold text-ink-900">Ready to validate your idea?</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-500">Get a structured, AI-assisted read on your startup in minutes — free to start.</p>
        <Link to="/register" className="mt-7 inline-block"><Button className="px-7 py-3 text-base">Start Validation <ArrowRight className="h-4 w-4" /></Button></Link>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Download PDF reports</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Unlimited ideas</span>
        </div>
      </section>
    </div>
  );
}
