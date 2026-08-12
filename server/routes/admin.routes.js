const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticateUser, requireAdmin } = require('../middleware/auth');

router.use(authenticateUser, requireAdmin);

router.get('/users', ctrl.listUsers);
router.patch('/users/:id/status', ctrl.updateUserStatus);
router.delete('/users/:id', ctrl.deleteUser);

router.get('/reports', ctrl.listAllReports);
router.delete('/reports/:id', ctrl.adminDeleteReport);

router.get('/analytics', ctrl.analytics);
router.get('/activity', ctrl.listActivity);

router.get('/prompts', ctrl.listPrompts);
router.put('/prompts/:id', ctrl.updatePrompt);
router.post('/prompts/:id/restore', ctrl.restorePromptDefault);

module.exports = router;
