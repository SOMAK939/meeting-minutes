const express = require('express');
const { generatePresignedUrl } = require('../controllers/s3Utils');
const router = express.Router();

router.get('/signed-url', generatePresignedUrl);

module.exports = router;
