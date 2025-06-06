// local-server.js - Updated for Render Deployment
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Updated allowedOrigins with more comprehensive list
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
  'https://cr8-agency.netlify.app',
  'https://cr8-nine.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173'
];

// More robust CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Check - Origin:', origin);

    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      console.log('✅ CORS - No origin, allowing request');
      return callback(null, true);
    }

    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS - Origin in allowed list:', origin);
      return callback(null, true);
    }

    // Allow Render, Railway, Vercel, and Netlify domains
    if (
      origin.includes('railway.app') ||
      origin.includes('vercel.app') ||
      origin.includes('netlify.app') ||
      origin.includes('onrender.com')
    ) {
      console.log('✅ CORS - Platform origin allowed:', origin);
      return callback(null, true);
    }

    // Allow localhost and 127.0.0.1 with any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      console.log('✅ CORS - Local origin allowed:', origin);
      return callback(null, true);
    }

    // For production debugging - temporarily log and allow all origins
    // Remove this in production once CORS is working
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ PRODUCTION - Temporarily allowing origin:', origin);
      return callback(null, true);
    }

    console.log('❌ CORS - Origin blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
};

// Apply security and CORS middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
  console.log('Origin:', req.get('Origin'));
  console.log('Host:', req.get('Host'));
  console.log('User-Agent:', req.get('User-Agent')?.substring(0, 100));
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Referer:', req.get('Referer'));

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CR8 Backend API',
    status: 'online',
    timestamp: new Date().toISOString(),
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

// Health check endpoint
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
    platform: process.platform,
    render: {
      service: process.env.RENDER_SERVICE_NAME || 'unknown',
      environment: process.env.RENDER_ENVIRONMENT || 'unknown',
      deployId: process.env.RENDER_DEPLOYMENT_ID || 'unknown'
    }
  };

  res.status(200).json(health);
});

// Training data endpoint
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

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    deployedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    platform: 'render'
  });
});

// Gemini endpoint - Enhanced with better error handling
app.post('/api/gemini', (req, res) => {
  console.log('POST /api/gemini - Request received');
  
  const { prompt } = req.body;

  if (!prompt) {
    console.log('❌ Missing prompt in request body');
    return res.status(400).json({ 
      error: 'Missing prompt in request body',
      received: Object.keys(req.body)
    });
  }

  console.log('✅ Valid prompt received, length:', prompt.length);

  // For testing, just echo back the prompt with a dummy response
  res.json({
    reply: `Received your prompt of length ${prompt.length}. (This is a placeholder response from CR8 backend.)`,
    timestamp: new Date().toISOString()
  });
});

// GET version of Gemini endpoint for testing
app.get('/api/gemini', (req, res) => {
  res.json({
    message: 'Gemini endpoint is working',
    method: 'GET',
    timestamp: new Date().toISOString(),
    note: 'Use POST method to send prompts'
  });
});

// Diagnose endpoint for debugging
app.get('/api/diagnose', (req, res) => {
  res.json({
    server: 'CR8 Backend',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    port: PORT,
    corsOrigins: allowedOrigins,
    headers: req.headers,
    method: req.method,
    url: req.originalUrl,
    platform: 'render'
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.originalUrl} not found`);
  res.status(404).json({
    error: 'Not Found',
    message: `${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
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

// Enhanced error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  
  if (err && err.message === 'Not allowed by CORS') {
    console.log('❌ CORS error for origin:', req.get('Origin'));
    return res.status(403).json({ 
      error: 'CORS origin denied',
      origin: req.get('Origin'),
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 CORS allowed origins:`, allowedOrigins);
});