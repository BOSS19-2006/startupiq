const StartupIdea = require('../models/StartupIdea');
const Report = require('../models/Report');
const PromptTemplate = require('../models/PromptTemplate');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { requestStructuredAnalysis } = require('../services/aiService');
const { computeScore } = require('../services/scoreService');
const { logActivity } = require('../services/activityService');

/**
 * POST /api/analysis
 * Body: { startupId } OR the full startup payload to create+analyze in one step.
 */
const runAnalysis = asyncHandler(async (req, res) => {
  const { startupId } = req.body;
  if (!startupId) throw new ApiError(400, 'startupId is required.', 'VALIDATION_ERROR');

  const startup = await StartupIdea.findById(startupId);
  if (!startup) throw new ApiError(404, 'Startup idea not found.', 'NOT_FOUND');
  if (String(startup.userId) !== String(req.user._id)) throw new ApiError(403, 'Forbidden.', 'FORBIDDEN');

  // Create a pending report placeholder first so status is always tracked.
  let report = await Report.create({
    userId: req.user._id,
    startupIdeaId: startup._id,
    analysisType: startup.analysisType,
    status: 'processing',
    score: { innovation: 0, marketDemand: 0, scalability: 0, businessModel: 0, competition: 0, executionFeasibility: 0, investmentPotential: 0, total: 0, label: 'Needs Significant Refinement' },
  });

  await logActivity({ userId: req.user._id, action: 'validation_started', resource: 'StartupIdea', resourceId: startup._id });

  let activeTemplate = null;
  try {
    activeTemplate = await PromptTemplate.findOne({ name: 'default_analysis', active: true });
  } catch (e) { /* non-fatal */ }

  try {
    const { analysis, aiMeta } = await requestStructuredAnalysis(startup, activeTemplate?.content);
    const score = computeScore(analysis.score);

    report.executiveSummary = analysis.executiveSummary || '';
    report.problemAnalysis = analysis.problemAnalysis || {};
    report.solutionAnalysis = analysis.solutionAnalysis || {};
    report.swot = analysis.swot || {};
    report.marketSizing = { ...report.marketSizing, ...analysis.marketSizing };
    report.businessModelCanvas = analysis.businessModelCanvas || {};
    report.competitorAnalysis = (analysis.competitorAnalysis || []).map((c) => ({ ...c, verificationStatus: 'AI-identified / requires verification' }));
    report.revenueModels = analysis.revenueModels || [];
    report.investorFeedback = analysis.investorFeedback || {};
    report.marketAnalysis = analysis.marketAnalysis || {};
    report.riskAssessment = analysis.riskAssessment || [];
    report.recommendations = analysis.recommendations || [];
    report.score = score;
    report.status = 'completed';
    report.aiMeta = aiMeta;

    await report.save();
    await logActivity({ userId: req.user._id, action: 'validation_completed', resource: 'Report', resourceId: report._id, metadata: { demoMode: aiMeta.demoMode } });

    sendSuccess(res, { report }, 201);
  } catch (err) {
    report.status = 'failed';
    report.failureReason = err.message || 'Unknown error';
    await report.save();
    await logActivity({ userId: req.user._id, action: 'validation_failed', resource: 'Report', resourceId: report._id, metadata: { reason: err.message } });
    throw err;
  }
});

const listAnalyses = asyncHandler(async (req, res) => {
  const reports = await Report.find({ userId: req.user._id }).sort({ createdAt: -1 }).select('status analysisType createdAt score.total startupIdeaId');
  sendSuccess(res, { reports });
});

const getAnalysis = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  if (String(report.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this resource.', 'FORBIDDEN');
  }
  sendSuccess(res, { report });
});

const deleteAnalysis = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  if (String(report.userId) !== String(req.user._id)) throw new ApiError(403, 'Forbidden.', 'FORBIDDEN');
  await report.deleteOne();
  sendSuccess(res, { message: 'Report deleted.' });
});

module.exports = { runAnalysis, listAnalyses, getAnalysis, deleteAnalysis };
