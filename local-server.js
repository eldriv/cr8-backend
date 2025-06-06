import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://cr8-agency.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔍 CORS Check - Origin:', origin);

    // Allow server-to-server requests with no Origin (e.g. health checks, curl)
    if (!origin) return callback(null, true);

    if (origin.includes('railway.app') || 
        origin.includes('vercel.app') || 
        origin.includes('netlify.app') ||
        allowedOrigins.includes(origin)) {
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

// Apply security headers first
app.use(helmet());

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
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

// Root route
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

// Health check route
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

// API version route
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    deployedAt: new Date().toISOString()
  });
});

// === GET /api/gemini ROUTE ===
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
