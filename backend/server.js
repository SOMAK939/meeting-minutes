const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');
const transcribeRoutes = require('./routes/transcribeRoutes');
const app = express();
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));



dotenv.config();

connectDB();

app.use(express.json()); // to parse JSON bodies
app.use('/api/s3', require('./routes/s3Routes'));              //router.get('/signed-url', generatePresignedUrl);
app.use('/api/gemini', require('./routes/geminiRoutes'));      //router.post('/summarize', summarizeTranscript);



app.use('/api/transcribe', transcribeRoutes);          
//router.post('/start', protect, startTranscription); 
//router.get('/status', protect, getTranscriptionResult);






app.use('/api/files', uploadRoutes);  //router.post('/upload', protect, uploadFile);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));   
//router.post('/login', loginUser);
//router.post('/register', registerUser);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
