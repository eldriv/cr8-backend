import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Whitelist origins for CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://cr8-agency.netlify.app/',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      return callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Example POST /api/gemini route
app.post('/api/gemini', (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  // Dummy response - replace with your actual logic
  res.json({ reply: `You said: "${prompt}"` });
});

// Health check route for Render or similar platforms
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
