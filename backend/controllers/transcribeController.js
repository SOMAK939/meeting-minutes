const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
const { v4: uuidv4 } = require('uuid');

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const startTranscription = async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ message: 'Missing file URL' });
  }
  console.log("Body received:", req.body);


  const jobName = `transcription-${uuidv4()}`;
  const mediaFormat = fileUrl.endsWith('.mp3') ? 'mp3' : 'wav';

  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US',
    MediaFormat: mediaFormat,
    Media: { MediaFileUri: fileUrl },
    OutputBucketName: process.env.AWS_BUCKET_NAME, // same as your S3 bucket
  });

  try {
    await transcribeClient.send(command);
    res.status(200).json({ message: 'Transcription job started', jobName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Transcription failed to start' });
  }
};

const getTranscriptionResult = async (req, res) => {
  console.log('Checking transcription status...'); 

  const { jobName } = req.query;

  if (!jobName) return res.status(400).json({ message: 'Missing job name' });

  const command = new GetTranscriptionJobCommand({
    TranscriptionJobName: jobName,
  });

   try {
    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    if (job.TranscriptionJobStatus === 'COMPLETED') {
      return res.status(200).json({
        status: 'COMPLETED',
        transcriptFileUrl: job.Transcript.TranscriptFileUri,
      });
    } else if (job.TranscriptionJobStatus === 'FAILED') {
      return res.status(200).json({ status: 'FAILED' });
    } else {
      return res.status(200).json({ status: 'in progress' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'ERROR', message: 'Error checking transcription status' });
  }
};
module.exports = {
  startTranscription,
  getTranscriptionResult, 
};


