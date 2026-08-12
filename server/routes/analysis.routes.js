const router = require('express').Router();
const ctrl = require('../controllers/analysis.controller');
const { authenticateUser } = require('../middleware/auth');
const { analysisLimiter } = require('../middleware/rateLimit');

router.use(authenticateUser);
router.post('/', analysisLimiter, ctrl.runAnalysis);
router.get('/', ctrl.listAnalyses);
router.get('/:id', ctrl.getAnalysis);
router.delete('/:id', ctrl.deleteAnalysis);

module.exports = router;
