const crypto = require('crypto');
const Report = require('../models/Report');
const StartupIdea = require('../models/StartupIdea');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateReportPdf } = require('../services/pdfService');
const { logActivity } = require('../services/activityService');

function checkOwnership(report, user) {
  if (String(report.userId) !== String(user._id) && user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this resource.', 'FORBIDDEN');
  }
}

const listReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const { search, industry, minScore, maxScore, stage, sort } = req.query;

  const filter = { userId: req.user._id };
  let startupIdFilter = null;

  if (search || industry || stage) {
    const startupFilter = { userId: req.user._id };
    if (search) startupFilter.startupName = { $regex: search, $options: 'i' };
    if (industry) startupFilter.industry = industry;
    if (stage) startupFilter.businessStage = stage;
    const matchingStartups = await StartupIdea.find(startupFilter).select('_id');
    startupIdFilter = matchingStartups.map((s) => s._id);
    filter.startupIdeaId = { $in: startupIdFilter };
  }

  if (minScore || maxScore) {
    filter['score.total'] = {};
    if (minScore) filter['score.total'].$gte = Number(minScore);
    if (maxScore) filter['score.total'].$lte = Number(maxScore);
  }

  let sortSpec = { createdAt: -1 };
  if (sort === 'oldest') sortSpec = { createdAt: 1 };
  if (sort === 'highest') sortSpec = { 'score.total': -1 };
  if (sort === 'lowest') sortSpec = { 'score.total': 1 };

  const [reports, total] = await Promise.all([
    Report.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit).populate('startupIdeaId', 'startupName industry businessStage'),
    Report.countDocuments(filter),
  ]);

  sendSuccess(res, { reports }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate('startupIdeaId');
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  checkOwnership(report, req.user);
  sendSuccess(res, { report });
});

const downloadReportPdf = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).populate('startupIdeaId');
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  checkOwnership(report, req.user);
  if (report.status !== 'completed') throw new ApiError(400, 'This report is not ready for download.', 'REPORT_NOT_READY');

  await logActivity({ userId: req.user._id, action: 'report_downloaded', resource: 'Report', resourceId: report._id });
  generateReportPdf(res, { startup: report.startupIdeaId, report });
});

const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  if (String(report.userId) !== String(req.user._id)) throw new ApiError(403, 'Forbidden.', 'FORBIDDEN');
  await report.deleteOne();
  sendSuccess(res, { message: 'Report deleted.' });
});

const toggleShare = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  if (String(report.userId) !== String(req.user._id)) throw new ApiError(403, 'Forbidden.', 'FORBIDDEN');

  const enable = !!req.body.enabled;
  report.share.enabled = enable;
  report.share.token = enable ? (report.share.token || crypto.randomBytes(24).toString('hex')) : null;
  await report.save();
  sendSuccess(res, { share: report.share });
});

const getSharedReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ 'share.token': req.params.token, 'share.enabled': true }).populate('startupIdeaId');
  if (!report) throw new ApiError(404, 'This shared report link is invalid or has been disabled.', 'NOT_FOUND');
  sendSuccess(res, { report });
});

module.exports = { listReports, getReport, downloadReportPdf, deleteReport, toggleShare, getSharedReport };
