const User = require('../models/User');
const Report = require('../models/Report');
const StartupIdea = require('../models/StartupIdea');
const PromptTemplate = require('../models/PromptTemplate');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { logActivity } = require('../services/activityService');
const { SYSTEM_INSTRUCTION } = require('../services/aiService');

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const filter = {};
  if (req.query.search) filter.$or = [
    { name: { $regex: req.query.search, $options: 'i' } },
    { email: { $regex: req.query.search, $options: 'i' } },
  ];
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  sendSuccess(res, { users }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'disabled'].includes(status)) throw new ApiError(400, 'Invalid status.', 'VALIDATION_ERROR');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.', 'NOT_FOUND');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot change status of an admin account.', 'FORBIDDEN');
  user.status = status;
  await user.save();
  await logActivity({ userId: req.user._id, action: 'admin_user_status_updated', resource: 'User', resourceId: user._id, metadata: { status } });
  sendSuccess(res, { user: { id: user._id, name: user.name, email: user.email, status: user.status } });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.', 'NOT_FOUND');
  if (user.role === 'admin') throw new ApiError(400, 'Cannot delete an admin account.', 'FORBIDDEN');
  await Promise.all([
    Report.deleteMany({ userId: user._id }),
    StartupIdea.deleteMany({ userId: user._id }),
    user.deleteOne(),
  ]);
  await logActivity({ userId: req.user._id, action: 'admin_user_deleted', resource: 'User', resourceId: user._id });
  sendSuccess(res, { message: 'User deleted.' });
});

const listAllReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 25);
  const [reports, total] = await Promise.all([
    Report.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('userId', 'name email').populate('startupIdeaId', 'startupName industry'),
    Report.countDocuments({}),
  ]);
  sendSuccess(res, { reports }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
});

const adminDeleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.', 'NOT_FOUND');
  await report.deleteOne();
  await logActivity({ userId: req.user._id, action: 'admin_report_deleted', resource: 'Report', resourceId: report._id });
  sendSuccess(res, { message: 'Report deleted.' });
});

const analytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
  const startOfMonth = new Date(now); startOfMonth.setDate(now.getDate() - 30);

  const [totalUsers, newUsersThisWeek, totalReports, reportsThisWeek, reportsThisMonth, avgScoreAgg, topIndustries, failedReports, activeUsers, totalStartups] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Report.countDocuments({}),
    Report.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Report.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Report.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, avg: { $avg: '$score.total' } } }]),
    StartupIdea.aggregate([{ $group: { _id: '$industry', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    Report.countDocuments({ status: 'failed' }),
    User.countDocuments({ status: 'active' }),
    StartupIdea.countDocuments({}),
  ]);

  sendSuccess(res, {
    totalUsers,
    newUsersThisWeek,
    totalReports,
    totalStartups,
    reportsThisWeek,
    reportsThisMonth,
    averageScore: avgScoreAgg[0]?.avg ? Math.round(avgScoreAgg[0].avg * 10) / 10 : 0,
    topIndustries: topIndustries.map((i) => ({ industry: i._id, count: i.count })),
    failedAiRequests: failedReports,
    activeUsers,
  });
});

const listActivity = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(200, parseInt(req.query.limit) || 50);
  const [logs, total] = await Promise.all([
    ActivityLog.find({}).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'name email'),
    ActivityLog.countDocuments({}),
  ]);
  sendSuccess(res, { logs }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
});

const listPrompts = asyncHandler(async (req, res) => {
  let templates = await PromptTemplate.find({});
  if (templates.length === 0) {
    // Lazily seed the single default template on first access.
    const created = await PromptTemplate.create({
      name: 'default_analysis',
      content: SYSTEM_INSTRUCTION,
      defaultContent: SYSTEM_INSTRUCTION,
      version: 1,
      active: true,
    });
    templates = [created];
  }
  sendSuccess(res, { templates });
});

const updatePrompt = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.length < 20) {
    throw new ApiError(400, 'Template content must be a meaningful string.', 'VALIDATION_ERROR');
  }
  // Content is stored and later interpolated as plain text into the AI prompt only -
  // it is never eval'd, never used as a template engine, and never executed as code.
  const template = await PromptTemplate.findById(req.params.id);
  if (!template) throw new ApiError(404, 'Template not found.', 'NOT_FOUND');

  template.content = content;
  template.version += 1;
  template.updatedBy = req.user._id;
  await template.save();
  await logActivity({ userId: req.user._id, action: 'admin_prompt_updated', resource: 'PromptTemplate', resourceId: template._id, metadata: { version: template.version } });
  sendSuccess(res, { template });
});

const restorePromptDefault = asyncHandler(async (req, res) => {
  const template = await PromptTemplate.findById(req.params.id);
  if (!template) throw new ApiError(404, 'Template not found.', 'NOT_FOUND');
  template.content = template.defaultContent;
  template.version += 1;
  await template.save();
  sendSuccess(res, { template });
});

module.exports = {
  listUsers, updateUserStatus, deleteUser, listAllReports, adminDeleteReport,
  analytics, listActivity, listPrompts, updatePrompt, restorePromptDefault,
};
