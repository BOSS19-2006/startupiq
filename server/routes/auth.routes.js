const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.get('/me', authenticateUser, ctrl.me);
router.post('/logout', authenticateUser, ctrl.logout);
router.put('/profile', authenticateUser, ctrl.updateProfile);
router.put('/password', authenticateUser, ctrl.updatePassword);
router.delete('/account', authenticateUser, ctrl.deleteAccount);

module.exports = router;
