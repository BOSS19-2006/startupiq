const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ctrl = require('../controllers/startup.controller');
const { authenticateUser } = require('../middleware/auth');
const ApiError = require('../utils/ApiError');

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads', 'pitchdecks'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.pdf`),
  }),
  limits: { fileSize: (Number(process.env.MAX_UPLOAD_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new ApiError(400, 'Only PDF pitch decks are accepted.', 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});

router.use(authenticateUser);
router.post('/', upload.single('pitchDeck'), ctrl.createStartup);
router.get('/', ctrl.listStartups);
router.get('/:id', ctrl.getStartup);
router.put('/:id', ctrl.updateStartup);
router.delete('/:id', ctrl.deleteStartup);

module.exports = router;
