const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes');
const transcribeRoutes = require('./routes/transcribeRoutes');
const app = express();
const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500','http://mom-frontend.s3-website.ap-south-1.amazonaws.com'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};


app.use(cors(corsOptions));
//ok


dotenv.config();

connectDB();

app.use(express.json()); // to parse JSON bodies
app.use('/api/s3', require('./routes/s3Routes'));              //router.get('/signed-url', generatePresignedUrl);
app.use('/api/gemini', require('./routes/geminiRoutes'));      //router.post('/summarize', summarizeTranscript);


// // This is a perfect health check route
// app.get('/', (req, res) => {
//   res.status(200).send('API is running!');
// });

app.use('/api/transcribe', transcribeRoutes);          
//router.post('/start', protect, startTranscription); 
//router.get('/status', protect, getTranscriptionResult);






app.use('/api/files', uploadRoutes);  //router.post('/upload', protect, uploadFile);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));   
//router.post('/login', loginUser);
//router.post('/register', registerUser);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
