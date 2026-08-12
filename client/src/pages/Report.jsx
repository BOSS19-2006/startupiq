import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Download, Share2, Trash2, Sparkles, ArrowRight, AlertTriangle,
} from 'lucide-react';
import api, { apiErrorMessage } from '../services/api.js';
import ScoreGauge from '../components/ScoreGauge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import ReportSection from '../components/ReportSection.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

function money(v, currency = 'USD') {
  if (v === undefined || v === null) return 'N/A';
  return `${currency} ${Number(v).toLocaleString()}`;
}

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data.data.report);
    } catch (err) {
      setError(apiErrorMessage(err, 'Unable to load this report.'));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const downloadPdf = async () => {
    try {
      const res = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `StartupIQ-${report.startupIdeaId.startupName}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to download PDF.'));
    }
  };

  const toggleShare = async () => {
    try {
      const res = await api.put(`/reports/${id}/share`, { enabled: !report.share?.enabled });
      setReport((r) => ({ ...r, share: res.data.data.share }));
      if (res.data.data.share.enabled) {
        const link = `${window.location.origin}/shared/${res.data.data.share.token}`;
        await navigator.clipboard.writeText(link).catch(() => {});
        toast.success('Share link copied to clipboard.');
      } else {
        toast.success('Sharing disabled for this report.');
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to update sharing.'));
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted.');
      navigate('/history');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Unable to delete report.'));
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner full label="Loading report..." />;
  if (error) return <ErrorState description={error} onRetry={load} />;
  if (!report) return null;

  const startup = report.startupIdeaId;
  const s = report.score;

  if (report.status !== 'completed') {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-4 font-display text-xl font-bold text-ink-900">
          {report.status === 'failed' ? 'This analysis failed' : 'This analysis is still processing'}
        </h2>
        <p className="mt-2 text-sm text-ink-500">{report.failureReason || 'Please check back shortly.'}</p>
        <Link to="/history" className="mt-6 inline-block"><Button variant="secondary">Back to history</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl pb-16">
      <ConfirmDialog open={confirmOpen} title="Delete this report?" description="This cannot be undone."
        confirmLabel="Delete" loading={deleting} onConfirm={doDelete} onCancel={() => setConfirmOpen(false)} />

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {report.aiMeta?.demoMode && <Badge tone="warning" className="mb-2">DEMO MODE — no live AI provider configured</Badge>}
          <h1 className="font-display text-2xl font-bold text-ink-900">{startup.startupName}</h1>
          <p className="text-sm text-ink-500">{startup.industry} &middot; {new Date(report.createdAt).toDateString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={downloadPdf}><Download className="h-4 w-4" /> Download PDF</Button>
          <Button variant="secondary" onClick={toggleShare}><Share2 className="h-4 w-4" /> {report.share?.enabled ? 'Sharing on' : 'Share'}</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
        </div>
      </div>

      {/* Executive summary */}
      <Card className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Executive Summary</p>
        <p className="mt-2 text-sm text-ink-700">{report.executiveSummary}</p>
      </Card>

      {/* Score dashboard */}
      <ReportSection eyebrow="Overall assessment" title="StartupIQ Score">
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <ScoreGauge score={s.total} label={s.label} size={200} />
          <div className="w-full flex-1 space-y-4">
            <ProgressBar label="Innovation" value={s.innovation} max={20} />
            <ProgressBar label="Market Demand" value={s.marketDemand} max={20} />
            <ProgressBar label="Scalability" value={s.scalability} max={20} />
            <ProgressBar label="Business Model" value={s.businessModel} max={15} />
            <ProgressBar label="Competition" value={s.competition} max={10} />
            <ProgressBar label="Execution Feasibility" value={s.executionFeasibility} max={10} />
            <ProgressBar label="Investment Potential" value={s.investmentPotential} max={5} />
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-500">{s.explanation}</p>
        <p className="mt-1 text-xs text-ink-500">Confidence: {s.confidence}. This score is advisory and does not guarantee success.</p>
      </ReportSection>

      {/* SWOT */}
      <ReportSection eyebrow="Idea assessment" title="SWOT Analysis">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ['Strengths', report.swot.strengths, 'success'], ['Weaknesses', report.swot.weaknesses, 'danger'],
            ['Opportunities', report.swot.opportunities, 'brand'], ['Threats', report.swot.threats, 'warning'],
          ].map(([label, items, tone]) => (
            <Card key={label}>
              <Badge tone={tone}>{label}</Badge>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-ink-700">
                {(items || []).map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </ReportSection>

      {/* Market sizing */}
      <ReportSection eyebrow="Opportunity" title="Market Size (TAM / SAM / SOM)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[['TAM', report.marketSizing.tam], ['SAM', report.marketSizing.sam], ['SOM', report.marketSizing.som]].map(([label, obj]) => (
            <Card key={label}>
              <p className="text-xs font-semibold uppercase text-ink-500">{label}</p>
              <p className="mt-1 font-data text-xl font-semibold text-ink-900">{money(obj?.value, obj?.currency)}</p>
              <p className="mt-1.5 text-xs text-ink-500">{obj?.description}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-4">
          <p className="text-sm font-semibold text-ink-900">Methodology</p>
          <p className="mt-1 text-sm text-ink-700">{report.marketSizing.methodology}</p>
          <p className="mt-3 text-sm font-semibold text-ink-900">Assumptions</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-700">
            {(report.marketSizing.assumptions || []).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          <p className="mt-3 text-xs text-ink-500">Confidence: {report.marketSizing.confidence}</p>
        </Card>
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{report.marketSizing.disclaimer}</p>
      </ReportSection>

      {/* Business Model Canvas */}
      <ReportSection eyebrow="Model" title="Business Model Canvas">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['Key Partners', report.businessModelCanvas.keyPartners], ['Key Activities', report.businessModelCanvas.keyActivities],
            ['Key Resources', report.businessModelCanvas.keyResources], ['Value Propositions', report.businessModelCanvas.valuePropositions],
            ['Customer Relationships', report.businessModelCanvas.customerRelationships], ['Channels', report.businessModelCanvas.channels],
            ['Customer Segments', report.businessModelCanvas.customerSegments], ['Cost Structure', report.businessModelCanvas.costStructure],
            ['Revenue Streams', report.businessModelCanvas.revenueStreams],
          ].map(([label, items]) => (
            <Card key={label} className="text-sm">
              <p className="font-semibold text-ink-900">{label}</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink-700">
                {(items || []).map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </ReportSection>

      {/* Competitors */}
      <ReportSection eyebrow="Landscape" title="Competitor Analysis">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-300/60 text-xs uppercase text-ink-500">
                <th className="py-2 pr-4">Competitor</th><th className="py-2 pr-4">Strength</th><th className="py-2 pr-4">Weakness</th>
                <th className="py-2 pr-4">Business Model</th><th className="py-2 pr-4">Threat</th>
              </tr>
            </thead>
            <tbody>
              {report.competitorAnalysis.map((c, i) => (
                <tr key={i} className="border-b border-ink-300/40 align-top">
                  <td className="py-3 pr-4 font-medium text-ink-900">{c.name}<br /><span className="text-xs font-normal text-ink-500">{c.verificationStatus}</span></td>
                  <td className="py-3 pr-4 text-ink-700">{(c.strengths || []).join(', ')}</td>
                  <td className="py-3 pr-4 text-ink-700">{(c.weaknesses || []).join(', ')}</td>
                  <td className="py-3 pr-4 text-ink-700">{c.businessModel}</td>
                  <td className="py-3 pr-4"><Badge tone={c.competitiveThreat === 'High' ? 'danger' : c.competitiveThreat === 'Low' ? 'success' : 'warning'}>{c.competitiveThreat}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>

      {/* Revenue models */}
      <ReportSection eyebrow="Monetization" title="Revenue Model Recommendations">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.revenueModels.map((r, i) => (
            <Card key={i}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">{r.model}</p>
                <Badge tone={r.implementationDifficulty === 'High' ? 'danger' : r.implementationDifficulty === 'Low' ? 'success' : 'warning'}>{r.implementationDifficulty}</Badge>
              </div>
              <p className="mt-1.5 text-sm text-ink-700">{r.whyItFits}</p>
              <p className="mt-2 text-xs font-semibold text-ink-500">Advantages</p>
              <p className="text-xs text-ink-700">{(r.advantages || []).join(', ')}</p>
              <p className="mt-1.5 text-xs font-semibold text-ink-500">Risks</p>
              <p className="text-xs text-ink-700">{(r.risks || []).join(', ')}</p>
            </Card>
          ))}
        </div>
      </ReportSection>

      {/* Investor feedback */}
      <ReportSection eyebrow="Fundraising" title="Investor Feedback">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold text-ink-500">Investment Attractiveness</p>
            <p className="font-data text-2xl font-semibold text-ink-900">{Math.round(report.investorFeedback.investmentAttractiveness || 0)}/100</p>
            <p className="mt-2 text-xs font-semibold text-ink-500">Funding Readiness</p>
            <Badge tone="brand">{report.investorFeedback.fundingReadiness}</Badge>
          </Card>
          <Card>
            <p className="text-xs font-semibold text-ink-500">Investor Concerns</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-700">
              {(report.investorFeedback.investorConcerns || []).map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Card>
        </div>
        <Card className="mt-4">
          <p className="text-xs font-semibold text-ink-500">What Investors Would Ask</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-ink-700">
            {(report.investorFeedback.investorQuestions || []).map((q, i) => <li key={i}>{q}</li>)}
          </ul>
          <p className="mt-3 text-xs font-semibold text-ink-500">Funding Recommendation</p>
          <p className="text-sm text-ink-700">{report.investorFeedback.fundingRecommendation}</p>
        </Card>
      </ReportSection>

      {/* Risk table */}
      <ReportSection eyebrow="Risk" title="Risk Assessment">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-300/60 text-xs uppercase text-ink-500">
                <th className="py-2 pr-4">Risk</th><th className="py-2 pr-4">Probability</th><th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Impact</th><th className="py-2 pr-4">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {report.riskAssessment.map((r, i) => (
                <tr key={i} className="border-b border-ink-300/40 align-top">
                  <td className="py-3 pr-4 font-medium text-ink-900">{r.category}<br /><span className="text-xs font-normal text-ink-500">{r.risk}</span></td>
                  <td className="py-3 pr-4"><Badge tone={r.probability === 'High' ? 'danger' : r.probability === 'Low' ? 'success' : 'warning'}>{r.probability}</Badge></td>
                  <td className="py-3 pr-4"><Badge tone={r.severity === 'High' ? 'danger' : r.severity === 'Low' ? 'success' : 'warning'}>{r.severity}</Badge></td>
                  <td className="py-3 pr-4 text-ink-700">{r.impact}</td>
                  <td className="py-3 pr-4 text-ink-700">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>

      {/* Recommendations */}
      <ReportSection eyebrow="Next steps" title="AI Recommendations">
        {['High', 'Medium', 'Low'].map((priority) => {
          const items = report.recommendations.filter((r) => r.priority === priority);
          if (!items.length) return null;
          return (
            <div key={priority} className="mb-4">
              <Badge tone={priority === 'High' ? 'danger' : priority === 'Low' ? 'neutral' : 'warning'}>{priority} priority</Badge>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-ink-700">
                {items.map((r, i) => <li key={i}>{r.text}</li>)}
              </ul>
            </div>
          );
        })}
      </ReportSection>

      <div className="mt-8 flex justify-center">
        <Link to="/validate"><Button className="px-6 py-3"><Sparkles className="h-4 w-4" /> Analyze Another Idea <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    </div>
  );
}
