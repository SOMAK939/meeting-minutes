const express = require('express');
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/upload', protect, uploadFile);

module.exports = router;
