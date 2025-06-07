import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());
const DEFAULT_TRAINING_DATA = `
CR8 - Digital Solutions Company
We specialize in software development, AI research, and digital solutions for businesses.
Portfolio includes web apps, mobile apps, and AI-powered tools.
Contact us at contact@cr8.com
`;

// Allow CORS for all origins or specify your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://cr8-agency.netlify.app', 
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/training-data', (req, res) => {
  res.type('text/plain').send(DEFAULT_TRAINING_DATA);
});

app.get('/api/gemini', (req, res) => {
  res.json({
    response: "Hello! This is the CR8 AI assistant. Please POST your questions to get detailed answers."
  });
});

app.post('/api/gemini', (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing prompt' });
  }
  const responseText = `You asked: "${prompt}". Here's a mocked response based on CR8 data.`;
  res.json({ response: responseText });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
