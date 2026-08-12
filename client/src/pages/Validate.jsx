import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, ArrowLeft, ArrowRight, UploadCloud, X } from 'lucide-react';
import api, { apiErrorMessage } from '../services/api.js';
import Input from '../components/Input.jsx';
import Textarea from '../components/Textarea.jsx';
import Select from '../components/Select.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { INDUSTRIES, STAGES, BUSINESS_MODELS, FUNDING_STATUSES, CUSTOMER_SEGMENTS, ANALYSIS_TYPES } from '../constants/formOptions.js';

const STEPS = [
  'Basic Info', 'Problem', 'Solution', 'Target Customer', 'Business Stage',
  'Competition', 'Revenue & Funding', 'Analysis Type',
];

const PROCESSING_STEPS = [
  'Understanding startup idea', 'Structuring problem and solution', 'Performing SWOT analysis',
  'Estimating market size', 'Evaluating business model', 'Analyzing competition',
  'Evaluating revenue strategy', 'Assessing investor potential', 'Identifying risks', 'Generating final report',
];

const initialForm = {
  startupName: '', industry: '', problem: '', solution: '', targetAudience: '',
  customerSegment: '', geography: '', businessStage: '', businessModel: '',
  competitorsText: '', fundingStatus: '', analysisType: 'Full Validation',
};

export default function Validate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [pitchDeck, setPitchDeck] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [processingIndex, setProcessingIndex] = useState(-1);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validateStep() {
    const e = {};
    if (step === 0) {
      if (!form.startupName.trim()) e.startupName = 'Startup name is required.';
      if (!form.industry) e.industry = 'Select an industry.';
    }
    if (step === 1 && form.problem.trim().length < 30) e.problem = 'Please describe the problem in at least 30 characters.';
    if (step === 2 && form.solution.trim().length < 30) e.solution = 'Please describe the solution in at least 30 characters.';
    if (step === 3) {
      if (!form.targetAudience.trim()) e.targetAudience = 'Target audience is required.';
      if (!form.customerSegment) e.customerSegment = 'Select a customer segment.';
      if (!form.geography.trim()) e.geography = 'Geographic market is required.';
    }
    if (step === 4 && !form.businessStage) e.businessStage = 'Select a business stage.';
    if (step === 6) {
      if (!form.businessModel) e.businessModel = 'Select a revenue/business model.';
      if (!form.fundingStatus) e.fundingStatus = 'Select a funding status.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => { if (validateStep()) setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Pitch deck must be a PDF file.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Pitch deck must be under 10 MB.'); return; }
    setPitchDeck(file);
  };

  async function runProcessingAnimation() {
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingIndex(i);
      await new Promise((r) => setTimeout(r, 260));
    }
  }

  const onSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'competitorsText') return;
        fd.append(k, v);
      });
      const competitors = form.competitorsText.split(',').map((c) => c.trim()).filter(Boolean);
      competitors.forEach((c) => fd.append('competitors[]', c));
      if (pitchDeck) fd.append('pitchDeck', pitchDeck);

      const [createRes] = await Promise.all([
        api.post('/startups', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
        runProcessingAnimation(),
      ]);
      const startupId = createRes.data.data.startup._id;

      const analysisRes = await api.post('/analysis', { startupId });
      const report = analysisRes.data.data.report;
      toast.success('Analysis complete.');
      navigate(`/report/${report._id}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'AI analysis is temporarily unavailable. Please try again.'));
      setSubmitting(false);
      setProcessingIndex(-1);
    }
  };

  if (submitting) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand" />
        <h2 className="mt-4 font-display text-xl font-bold text-ink-900">Analyzing your startup...</h2>
        <ul className="mt-8 space-y-2 text-left">
          {PROCESSING_STEPS.map((s, i) => (
            <li key={s} className={`flex items-center gap-2 text-sm ${i <= processingIndex ? 'text-ink-900' : 'text-ink-500/50'}`}>
              {i < processingIndex ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : i === processingIndex ? <Loader2 className="h-4 w-4 animate-spin text-brand" /> : <span className="h-4 w-4 rounded-full border border-ink-300" />}
              {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">New Validation</h1>
      <p className="mt-1 text-sm text-ink-500">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full bg-brand transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <Card className="mt-6">
        {step === 0 && (
          <div className="space-y-4">
            <Input id="startupName" label="Startup Name" value={form.startupName} onChange={set('startupName')} error={errors.startupName} />
            <Select id="industry" label="Industry" options={INDUSTRIES} value={form.industry} onChange={set('industry')} error={errors.industry} />
          </div>
        )}
        {step === 1 && (
          <Textarea id="problem" label="Problem Statement" rows={6} placeholder="What specific problem are you solving?"
            hint={`${form.problem.length} characters (minimum 30)`} value={form.problem} onChange={set('problem')} error={errors.problem} />
        )}
        {step === 2 && (
          <Textarea id="solution" label="Solution Description" rows={6} placeholder="How does your product/service solve this problem?"
            hint={`${form.solution.length} characters (minimum 30)`} value={form.solution} onChange={set('solution')} error={errors.solution} />
        )}
        {step === 3 && (
          <div className="space-y-4">
            <Input id="targetAudience" label="Target Audience" value={form.targetAudience} onChange={set('targetAudience')} error={errors.targetAudience} />
            <Select id="customerSegment" label="B2B / B2C / B2B2C" options={CUSTOMER_SEGMENTS} value={form.customerSegment} onChange={set('customerSegment')} error={errors.customerSegment} />
            <Input id="geography" label="Geographic Market" value={form.geography} onChange={set('geography')} error={errors.geography} />
          </div>
        )}
        {step === 4 && (
          <Select id="businessStage" label="Business Stage" options={STAGES} value={form.businessStage} onChange={set('businessStage')} error={errors.businessStage} />
        )}
        {step === 5 && (
          <div className="space-y-4">
            <Input id="competitors" label="Known Competitors (optional, comma-separated)" placeholder="e.g. OLX, Facebook Marketplace"
              value={form.competitorsText} onChange={set('competitorsText')} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Pitch Deck (optional PDF, max 10 MB)</label>
              {pitchDeck ? (
                <div className="flex items-center justify-between rounded-lg border border-ink-300 px-3.5 py-2.5 text-sm">
                  <span className="truncate text-ink-900">{pitchDeck.name}</span>
                  <button onClick={() => setPitchDeck(null)} aria-label="Remove file"><X className="h-4 w-4 text-ink-500" /></button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-ink-300 px-3.5 py-6 text-sm text-ink-500 hover:bg-slate-50">
                  <UploadCloud className="h-4.5 w-4.5" /> Upload PDF
                  <input type="file" accept="application/pdf" className="hidden" onChange={onFile} />
                </label>
              )}
            </div>
          </div>
        )}
        {step === 6 && (
          <div className="space-y-4">
            <Select id="businessModel" label="How do you plan to make money?" options={BUSINESS_MODELS} value={form.businessModel} onChange={set('businessModel')} error={errors.businessModel} />
            <Select id="fundingStatus" label="Funding Status" options={FUNDING_STATUSES} value={form.fundingStatus} onChange={set('fundingStatus')} error={errors.fundingStatus} />
          </div>
        )}
        {step === 7 && (
          <div className="space-y-3">
            {ANALYSIS_TYPES.map((a) => (
              <label key={a.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 ${form.analysisType === a.value ? 'border-brand bg-blue-50/50' : 'border-ink-300'}`}>
                <input type="radio" name="analysisType" className="mt-1" checked={form.analysisType === a.value}
                  onChange={() => setForm((f) => ({ ...f, analysisType: a.value }))} />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{a.label}</span>
                  <span className="block text-xs text-ink-500">{a.description}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="secondary" onClick={back} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Next <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={onSubmit}>Analyze My Startup</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
