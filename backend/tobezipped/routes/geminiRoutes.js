const express = require('express');
const { summarizeTranscript } = require('../controllers/geminiController');
const router = express.Router();

router.post('/summarize', summarizeTranscript);

module.exports = router;
