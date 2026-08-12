const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { registerSchema, loginSchema, updateProfileSchema, updatePasswordSchema } = require('../validators/auth.validator');
const { logActivity } = require('../services/activityService');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    status: user.status,
    createdAt: user.createdAt,
  };
}

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors[0].message, 'VALIDATION_ERROR');
  }
  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.', 'DUPLICATE_EMAIL');

  const passwordHash = await bcrypt.hash(password, 12);
  // Public registration can only ever create a 'user' role - admins are seeded separately.
  const user = await User.create({ name, email, passwordHash, role: 'user' });

  const token = signToken(user);
  await logActivity({ userId: user._id, action: 'register' });
  sendSuccess(res, { token, user: toPublicUser(user) }, 201);
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.errors[0].message, 'VALIDATION_ERROR');
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  if (user.status === 'disabled') throw new ApiError(403, 'This account has been disabled.', 'ACCOUNT_DISABLED');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');

  const token = signToken(user);
  await logActivity({ userId: user._id, action: 'login' });
  sendSuccess(res, { token, user: toPublicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: toPublicUser(req.user) });
});

const logout = asyncHandler(async (req, res) => {
  // JWTs are stateless; logout is handled client-side by discarding the token.
  await logActivity({ userId: req.user._id, action: 'logout' });
  sendSuccess(res, { message: 'Logged out.' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0].message, 'VALIDATION_ERROR');

  const update = {};
  if (parsed.data.name) update.name = parsed.data.name;
  if (parsed.data.profile) update.profile = { ...req.user.profile.toObject?.() || req.user.profile, ...parsed.data.profile };

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
  sendSuccess(res, { user: toPublicUser(user) });
});

const updatePassword = asyncHandler(async (req, res) => {
  const parsed = updatePasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.errors[0].message, 'VALIDATION_ERROR');

  const user = await User.findById(req.user._id).select('+passwordHash');
  const match = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!match) throw new ApiError(401, 'Current password is incorrect.', 'INVALID_CREDENTIALS');

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  await logActivity({ userId: user._id, action: 'password_updated' });
  sendSuccess(res, { message: 'Password updated.' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  const StartupIdea = require('../models/StartupIdea');
  const Report = require('../models/Report');
  await Promise.all([
    Report.deleteMany({ userId: req.user._id }),
    StartupIdea.deleteMany({ userId: req.user._id }),
    User.findByIdAndDelete(req.user._id),
  ]);
  await logActivity({ userId: req.user._id, action: 'account_deleted' });
  sendSuccess(res, { message: 'Account deleted.' });
});

module.exports = { register, login, me, logout, updateProfile, updatePassword, deleteAccount };
