import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
app.use(cors({
  origin: 'https://cr8-agency-production.up.railway.app',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log('Origin:', req.get('Origin'));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method === 'POST' && req.body) console.log('Body:', JSON.stringify(req.body, null, 2));
  const originalJson = res.json;
  res.json = function (body) {
    console.log(`[${timestamp}] Response:`, JSON.stringify(body, null, 2));
    return originalJson.call(this, body);
  };
  next();
});

// Test POST endpoint
app.post('/api/test-post', (req, res) => {
  console.log('POST /api/test-post received');
  res.json({ message: 'POST request successful', body: req.body });
});

// Gemini endpoint - Moved earlier
app.post('/api/gemini', async (req, res) => {
  console.log('POST /api/gemini received');
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Invalid prompt' });
    if (prompt.length > 10000) return res.status(400).json({ error: 'Prompt too long' });
    const data = await callGeminiAPI(prompt);
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) return res.status(500).json({ error: 'No AI response' });
    res.json({ text: responseText });
  } catch (error) {
    console.error('POST /api/gemini error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

const TRAINING_DATA = `CR8 - Digital Solutions Company

CR8 is a digital creative agency that helps clients bring their creative vision to life through graphic design, video editing, animation, and motion graphics.

What's the tagline of CR8?
Let's Create & Unleash Your Creative Vision.

How can I contact CR8?
You can reach us via email at creativscr8@gmail.com or eldriv@proton.me

Where can I view CR8's portfolio?
You can view our portfolio here: https://cr8-nine.vercel.app/#works

What services does CR8 offer?
We offer the following creative services:
- Graphic Design
- Video Editing
- Motion Graphics
- Animation
- Logo Animation

Who does CR8 serve?
We serve clients who need visual storytelling and branding services. Our goal is to bring your vision to life with creative execution.

What is CR8's production process?
Our production process includes:
1. Understanding Your Brand – We exchange ideas to align with your vision.
2. Drafting Storyboard (24–48 hours) – We prepare and finalize a storyboard; changes during production may incur fees.
3. Production (12–72 hours) – Our team executes and reviews the project based on the approved storyboard.
4. Client Approval – Feedback is collected through Frame.io, with support available.
5. Revision – Revisions are made based on feedback. After 3 rounds, extra fees may apply.

What's included in the LOE 1 package?
LOE 1 includes:
- Basic Short Form Video (30s–1m)
- Basic Long Form Video (5m–10m)
- Basic Motion Graphic Elements (Lower Thirds)

What's included in the LOE 2 package?
LOE 2 includes:
- Short Form Video (30s–1m)
- Long Form Video (5m–20m)
- Motion Graphics (Lower Thirds, Intro Animation, Logo Animation)

What's included in the LOE 3 package?
LOE 3 includes:
- Advanced Video Editing with VFX
- Template Creation
- Full Motion Graphics (Lower Thirds, Intro Animation, Logo Animation)

Can I customize a package?
Yes! You can choose any combination of services from our packages to create a customized solution based on your needs.

Why do brands trust CR8?
Brands trust CR8 because we:
- Uphold the highest quality standards
- Align projects with brand identity
- Stay current with industry trends`;

// Root route
app.get('/', (req, res) => res.json({ message: 'CR8 Backend Server', status: 'OK', timestamp: new Date().toISOString() }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    supportedMethods: {
      '/api/gemini': ['POST', 'OPTIONS'],
      '/api/test-post': ['POST', 'OPTIONS'],
      '/api/health': ['GET', 'OPTIONS'],
      '/api/training-data': ['GET', 'OPTIONS'],
      '/api/diagnose': ['GET', 'OPTIONS']
    }
  });
});

// Training data
app.get('/api/training-data', (req, res) => {
  console.log('Serving training data');
  res.set({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
  res.send(TRAINING_DATA);
});

// Gemini API helper
const callGeminiAPI = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
    ]
  };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.status}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Diagnostics
app.get('/api/diagnose', (req, res) => {
  res.json({
    message: 'Diagnostics',
    timestamp: new Date().toISOString(),
    server: { nodeVersion: process.version, port: PORT },
    api: { hasGeminiKey: !!process.env.GEMINI_API_KEY }
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not Found', path: req.originalUrl }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message, err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}, Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`Gemini API Key: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing'}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));