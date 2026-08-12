const StartupIdea = require('../models/StartupIdea');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { startupIdeaSchema } = require('../validators/startup.validator');
const { logActivity } = require('../services/activityService');

const createStartup = asyncHandler(async (req, res) => {
  const parsed = startupIdeaSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0].message, 'VALIDATION_ERROR');

  const data = { ...parsed.data, userId: req.user._id };

  if (req.file) {
    data.pitchDeck = {
      originalName: req.file.originalname,
      storedPath: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    };
  }

  const startup = await StartupIdea.create(data);
  await logActivity({ userId: req.user._id, action: 'startup_created', resource: 'StartupIdea', resourceId: startup._id });
  sendSuccess(res, { startup }, 201);
});

const listStartups = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const [items, total] = await Promise.all([
    StartupIdea.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    StartupIdea.countDocuments({ userId: req.user._id }),
  ]);
  sendSuccess(res, { startups: items }, 200, { page, limit, total, pages: Math.ceil(total / limit) });
});

const getStartup = asyncHandler(async (req, res) => {
  const startup = await StartupIdea.findById(req.params.id);
  if (!startup) throw new ApiError(404, 'Startup idea not found.', 'NOT_FOUND');
  if (String(startup.userId) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError(403, 'You do not have access to this resource.', 'FORBIDDEN');
  }
  sendSuccess(res, { startup });
});

const updateStartup = asyncHandler(async (req, res) => {
  const startup = await StartupIdea.findById(req.params.id);
  if (!startup) throw new ApiError(404, 'Startup idea not found.', 'NOT_FOUND');
  if (String(startup.userId) !== String(req.user._id)) throw new ApiError(403, 'Forbidden.', 'FORBIDDEN');

  const parsed = startupIdeaSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0].message, 'VALIDATION_ERROR');

  Object.assign(startup, parsed.data);
  await startup.save();
  sendSuccess(res, { startup });
});

const deleteStartup = asyncHandler(async (req, res) => {
  const startup = await StartupIdea.findById(req.params.id);
  if (!startup) throw new ApiError(404, 'Startup idea not found.', 'NOT_FOUND');
  if (String(startup.userId) !== String(req.user._id)) throw new ApiError(403, 'Forbidden.', 'FORBIDDEN');

  const Report = require('../models/Report');
  await Promise.all([Report.deleteMany({ startupIdeaId: startup._id }), startup.deleteOne()]);
  await logActivity({ userId: req.user._id, action: 'startup_deleted', resource: 'StartupIdea', resourceId: startup._id });
  sendSuccess(res, { message: 'Startup idea deleted.' });
});

module.exports = { createStartup, listStartups, getStartup, updateStartup, deleteStartup };
