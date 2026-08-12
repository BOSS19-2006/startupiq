const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const startupRoutes = require('./routes/startup.routes');
const analysisRoutes = require('./routes/analysis.routes');
const reportRoutes = require('./routes/report.routes');
const adminRoutes = require('./routes/admin.routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimit');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(generalLimiter);

// Simple maintenance-mode gate (checked before routes, admins pass through via token).
app.use((req, res, next) => {
  if (process.env.MAINTENANCE_MODE === 'true' && !req.path.startsWith('/api/auth')) {
    return res.status(503).json({
      success: false,
      message: 'StartupIQ is temporarily under maintenance. Please try again later.',
      code: 'MAINTENANCE_MODE',
    });
  }
  next();
});

app.get('/api/health', (req, res) => res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }));

app.use('/api/auth', authRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
