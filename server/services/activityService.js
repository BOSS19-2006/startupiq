const ActivityLog = require('../models/ActivityLog');

async function logActivity({ userId, action, resource = '', resourceId = null, metadata = {} }) {
  try {
    await ActivityLog.create({ userId, action, resource, resourceId, metadata });
  } catch (err) {
    // Activity logging must never break the primary request flow.
    console.error('[ActivityLog] failed to record:', err.message);
  }
}

module.exports = { logActivity };
