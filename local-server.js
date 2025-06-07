// local-server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

const DEFAULT_TRAINING_DATA = `
CR8 - Digital Solutions Company
We specialize in software development, AI research, and digital solutions for businesses.
Portfolio includes web apps, mobile apps, and AI-powered tools.
Contact us at contact@cr8.com
`;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Training data endpoint
app.get('/api/training-data', (req, res) => {
  res.type('text/plain').send(DEFAULT_TRAINING_DATA);
});

// /api/gemini GET endpoint - returns a default response or simple AI reply
app.get('/api/gemini', (req, res) => {
  res.json({
    response: "Hello! This is the CR8 AI assistant. Please POST your questions to get detailed answers."
  });
});

// /api/gemini POST endpoint - expects { prompt } JSON, returns mock AI response
app.post('/api/gemini', (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing prompt' });
  }

  // Simple mocked AI response logic (replace with real AI integration)
  let responseText = `You asked: "${prompt}".\nHere's a mocked response based on CR8 data.`;

  // You can add logic to parse prompt and return different answers if you want.

  res.json({ response: responseText });
});

// Start server
app.listen(PORT, () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});
