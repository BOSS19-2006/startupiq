const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.', code: 'RATE_LIMITED' },
});

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: () => Number(process.env.ANALYSIS_RATE_LIMIT_PER_HOUR || 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? String(req.user._id) : req.ip),
  message: { success: false, message: 'Analysis rate limit reached. Please try again later.', code: 'RATE_LIMITED' },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, analysisLimiter, generalLimiter };
