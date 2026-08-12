const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error.';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors).map((e) => e.message).join(' ');
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid identifier supplied.';
  }
  // Mongo connection errors (includes the generic "buffering timed out" MongooseError
  // thrown when a query is issued while there is no active connection at all).
  if (
    err.name === 'MongoServerSelectionError' ||
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongooseError' ||
    err.name === 'MongoNetworkError'
  ) {
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'The database is temporarily unavailable. Please try again shortly.';
  }

  // Never leak raw internals for anything we didn't explicitly recognize above.
  if (statusCode >= 500 && code === 'INTERNAL_ERROR') {
    message = 'Something went wrong on our end. Please try again.';
  }

  if (statusCode >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({ success: false, message, code });
}

module.exports = { notFoundHandler, errorHandler };
