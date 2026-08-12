const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { authenticateUser } = require('../middleware/auth');

router.get('/shared/:token', ctrl.getSharedReport);

router.use(authenticateUser);
router.get('/', ctrl.listReports);
router.get('/:id', ctrl.getReport);
router.get('/:id/pdf', ctrl.downloadReportPdf);
router.put('/:id/share', ctrl.toggleShare);
router.delete('/:id', ctrl.deleteReport);

module.exports = router;
