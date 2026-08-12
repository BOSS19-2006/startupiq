const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const authenticateUser = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required.', 'NO_TOKEN');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token.', 'INVALID_TOKEN');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw new ApiError(401, 'User no longer exists.', 'USER_NOT_FOUND');
  if (user.status === 'disabled') throw new ApiError(403, 'This account has been disabled.', 'ACCOUNT_DISABLED');

  req.user = user;
  next();
});

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin access required.', 'FORBIDDEN');
  }
  next();
};

module.exports = { authenticateUser, requireAdmin };
