const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const generatePresignedUrl = async (req, res) => {
  const { key } = req.query; // e.g., transcription-abc123.json

  if (!key) return res.status(400).json({ message: 'Missing key' });

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 60*24 }); // 24 hrs
    return res.status(200).json({ url: signedUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate signed URL' });
  }
};

module.exports = { generatePresignedUrl };
