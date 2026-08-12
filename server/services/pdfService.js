const PDFDocument = require('pdfkit');

function money(v, currency = 'USD') {
  if (v === undefined || v === null || Number.isNaN(Number(v))) return 'N/A';
  return `${currency} ${Number(v).toLocaleString()}`;
}

function h1(doc, text) {
  doc.moveDown(0.5).fontSize(16).fillColor('#2563EB').font('Helvetica-Bold').text(text);
  doc.moveDown(0.2).fillColor('#111827').font('Helvetica');
}

function h2(doc, text) {
  doc.moveDown(0.3).fontSize(12).fillColor('#374151').font('Helvetica-Bold').text(text);
  doc.font('Helvetica').fillColor('#111827');
}

function p(doc, text) {
  doc.fontSize(10).text(String(text || '-'), { align: 'left' });
}

function bulletList(doc, items) {
  if (!items || !items.length) {
    p(doc, '-');
    return;
  }
  items.forEach((item) => doc.fontSize(10).text(`•  ${item}`, { indent: 10 }));
}

/**
 * Streams a professional PDF report directly to an Express response.
 * Sanitizes text (PDFKit draws plain text only - no HTML/script execution risk).
 */
function generateReportPdf(res, { startup, report }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="StartupIQ-${startup.startupName.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
  doc.pipe(res);

  // Cover
  doc.fontSize(26).fillColor('#2563EB').font('Helvetica-Bold').text('StartupIQ', { align: 'left' });
  doc.fontSize(10).fillColor('#6B7280').font('Helvetica').text('AI-Powered Startup Idea Validation & Business Analysis');
  doc.moveDown(1.5);
  doc.fontSize(20).fillColor('#111827').font('Helvetica-Bold').text(startup.startupName);
  doc.fontSize(11).fillColor('#374151').font('Helvetica').text(`Industry: ${startup.industry}`);
  doc.text(`Report date: ${new Date(report.createdAt).toDateString()}`);
  doc.text(`Overall StartupIQ Score: ${report.score.total} / 100 — ${report.score.label}`);
  if (report.aiMeta?.demoMode) {
    doc.moveDown(0.5).fillColor('#B45309').font('Helvetica-Bold').text('DEMO MODE: Generated without a live AI provider configured.');
    doc.fillColor('#111827').font('Helvetica');
  }

  // 1. Executive Summary
  h1(doc, '1. Executive Summary');
  p(doc, report.executiveSummary);

  // 2. Problem & Solution
  h1(doc, '2. Problem & Solution');
  h2(doc, 'Problem'); p(doc, startup.problem);
  h2(doc, 'Solution'); p(doc, startup.solution);

  // 3. SWOT
  h1(doc, '3. SWOT Analysis');
  h2(doc, 'Strengths'); bulletList(doc, report.swot?.strengths);
  h2(doc, 'Weaknesses'); bulletList(doc, report.swot?.weaknesses);
  h2(doc, 'Opportunities'); bulletList(doc, report.swot?.opportunities);
  h2(doc, 'Threats'); bulletList(doc, report.swot?.threats);

  // 4. Market sizing
  doc.addPage();
  h1(doc, '4. TAM / SAM / SOM');
  h2(doc, `TAM: ${money(report.marketSizing?.tam?.value, report.marketSizing?.tam?.currency)}`);
  p(doc, report.marketSizing?.tam?.description);
  h2(doc, `SAM: ${money(report.marketSizing?.sam?.value, report.marketSizing?.sam?.currency)}`);
  p(doc, report.marketSizing?.sam?.description);
  h2(doc, `SOM: ${money(report.marketSizing?.som?.value, report.marketSizing?.som?.currency)}`);
  p(doc, report.marketSizing?.som?.description);
  h2(doc, 'Methodology'); p(doc, report.marketSizing?.methodology);
  h2(doc, 'Assumptions'); bulletList(doc, report.marketSizing?.assumptions);
  h2(doc, `Confidence: ${report.marketSizing?.confidence || 'N/A'}`);
  doc.moveDown(0.3).fontSize(9).fillColor('#6B7280').text(report.marketSizing?.disclaimer || '');
  doc.fillColor('#111827');

  // 5. BMC
  h1(doc, '5. Business Model Canvas');
  const bmc = report.businessModelCanvas || {};
  const blocks = [
    ['Key Partners', bmc.keyPartners], ['Key Activities', bmc.keyActivities], ['Key Resources', bmc.keyResources],
    ['Value Propositions', bmc.valuePropositions], ['Customer Relationships', bmc.customerRelationships],
    ['Channels', bmc.channels], ['Customer Segments', bmc.customerSegments], ['Cost Structure', bmc.costStructure],
    ['Revenue Streams', bmc.revenueStreams],
  ];
  blocks.forEach(([label, items]) => { h2(doc, label); bulletList(doc, items); });

  // 6. Competitors
  doc.addPage();
  h1(doc, '6. Competitor Analysis');
  (report.competitorAnalysis || []).forEach((c) => {
    h2(doc, `${c.name} (${c.verificationStatus || 'AI-identified / requires verification'})`);
    p(doc, `Business model: ${c.businessModel || 'N/A'} | Threat: ${c.competitiveThreat || 'N/A'}`);
    p(doc, `Differentiation opportunity: ${c.differentiationOpportunity || '-'}`);
  });

  // 7. Revenue models
  h1(doc, '7. Revenue Model Recommendations');
  (report.revenueModels || []).forEach((r) => {
    h2(doc, `${r.model} (Difficulty: ${r.implementationDifficulty})`);
    p(doc, r.whyItFits);
  });

  // 8. Investor feedback
  doc.addPage();
  h1(doc, '8. Investor Feedback');
  const inv = report.investorFeedback || {};
  p(doc, `Investment attractiveness: ${inv.investmentAttractiveness ?? 'N/A'} / 100`);
  p(doc, `Funding readiness: ${inv.fundingReadiness || 'N/A'}`);
  h2(doc, 'Investor concerns'); bulletList(doc, inv.investorConcerns);
  h2(doc, 'Investor questions'); bulletList(doc, inv.investorQuestions);
  h2(doc, 'Funding recommendation'); p(doc, inv.fundingRecommendation);

  // 9. Market analysis
  h1(doc, '9. Market Analysis');
  const ma = report.marketAnalysis || {};
  p(doc, `Target market: ${ma.targetMarket || '-'}`);
  h2(doc, 'Market drivers'); bulletList(doc, ma.marketDrivers);
  h2(doc, 'Market barriers'); bulletList(doc, ma.marketBarriers);

  // 10. Risk
  doc.addPage();
  h1(doc, '10. Risk Assessment');
  (report.riskAssessment || []).forEach((r) => {
    h2(doc, `${r.category} — Severity: ${r.severity}, Probability: ${r.probability}`);
    p(doc, `Impact: ${r.impact}`);
    p(doc, `Mitigation: ${r.mitigation}`);
  });

  // 11. Recommendations
  h1(doc, '11. Recommendations');
  ['High', 'Medium', 'Low'].forEach((priority) => {
    const items = (report.recommendations || []).filter((r) => r.priority === priority).map((r) => r.text);
    if (items.length) { h2(doc, `${priority} priority`); bulletList(doc, items); }
  });

  // 12. Score
  doc.addPage();
  h1(doc, '12. StartupIQ Score');
  const s = report.score;
  [
    ['Innovation', s.innovation, 20], ['Market Demand', s.marketDemand, 20], ['Scalability', s.scalability, 20],
    ['Business Model', s.businessModel, 15], ['Competition', s.competition, 10],
    ['Execution Feasibility', s.executionFeasibility, 10], ['Investment Potential', s.investmentPotential, 5],
  ].forEach(([label, val, max]) => p(doc, `${label}: ${val} / ${max}`));
  doc.moveDown(0.3);
  h2(doc, `Overall: ${s.total} / 100 — ${s.label}`);
  p(doc, s.explanation);

  // Disclaimer
  doc.moveDown(1);
  doc.fontSize(9).fillColor('#6B7280').text(
    'Disclaimer: This AI-generated analysis is intended for preliminary decision support and does not constitute financial, investment, legal, or professional advice.',
    { align: 'left' }
  );

  doc.end();
}

module.exports = { generateReportPdf };
