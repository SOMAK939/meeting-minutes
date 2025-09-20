const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const s3 = require('../config/s3');
const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp3' && ext !== '.wav') {
      return cb(new Error('Only .mp3 or .wav files allowed'));
    }
    cb(null, true);
  },
}).single('audio');

const uploadFile = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const file = req.file;
    const user = req.user;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `${uuidv4()}-${file.originalname}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

      // (Optional) Store file URL and metadata in MongoDB here...

      res.status(200).json({ fileUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error uploading to S3' });
    }
  });
};

module.exports = { uploadFile };
