const express = require('express');
const { startTranscription, getTranscriptionResult } = require('../controllers/transcribeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/start', protect, startTranscription);
router.get('/status', protect, getTranscriptionResult);

module.exports = router;
