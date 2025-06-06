// local-server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Fix missing comma in allowedOrigins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
  'https://cr8-agency.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Check - Origin:', origin);

    if (!origin) return callback(null, true);

    if (
      origin.includes('railway.app') ||
      origin.includes('vercel.app') ||
      origin.includes('netlify.app') ||
      allowedOrigins.includes(origin)
    ) {
      console.log('✅ CORS - Origin allowed:', origin);
      return callback(null, true);
    }

    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ CORS - Local origin allowed:', origin);
      return callback(null, true);
    }

    console.log('❌ CORS - Origin blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log('Origin:', req.get('Origin'));
  console.log('User-Agent:', req.get('User-Agent')?.substring(0, 100));
  console.log('Content-Type:', req.get('Content-Type'));

  if (req.method === 'POST' && req.body) {
    console.log('Body keys:', Object.keys(req.body));
    if (req.body.prompt) {
      console.log('Prompt length:', req.body.prompt.length);
      console.log('Prompt preview:', req.body.prompt.substring(0, 100) + '...');
    }
  }

  res.on('finish', () => {
    console.log(`Response status: ${res.statusCode}`);
  });

  next();
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CR8 Backend API',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/training-data',
      'POST /api/gemini',
      'GET /api/gemini',
      'GET /api/diagnose',
      'GET /api/version'
    ]
  });
});

app.get('/api/health', (req, res) => {
  console.log('Health check accessed');
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'production',
    port: PORT,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    nodeVersion: process.version,
    railway: {
      service: process.env.RAILWAY_SERVICE_NAME || 'unknown',
      environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
      deployId: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown'
    }
  };

  res.status(200).json(health);
});

app.get('/api/training-data', (req, res) => {
  const trainingData = `
CR8 - Digital Solutions Company

CR8 is a digital creative agency that helps clients bring their creative vision to life through graphic design, video editing, animation, and motion graphics.
What's the tagline of CR8?
Let's Create & Unleash Your Creative Vision.
How can I contact CR8?
You can reach us via email at creativscr8@gmail.com or eldriv@proton.me
Where can I view CR8's portfolio?
You can view our portfolio here: https://cr8-agency.netlify.app/#works
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
- Stay current with industry trends
`;

  res.json({ trainingData });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    deployedAt: new Date().toISOString()
  });
});

app.get('/api/gemini', (req, res) => {
  res.json({
    message: 'CR8 Gemini API endpoint',
    usage: 'Use POST /api/gemini with { prompt } in the JSON body to get a response.'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    error: 'Not Found',
    message: `${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/training-data',
      'POST /api/gemini',
      'GET /api/gemini',
      'GET /api/diagnose',
      'GET /api/version'
    ]
  });
});

// Error handler for CORS and others
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    console.log('❌ CORS error:', err.message);
    return res.status(403).json({ error: 'CORS origin denied' });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
